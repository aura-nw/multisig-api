import { Registry } from '@cosmjs/proto-signing';
import { AuthInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from '../../dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { IMultisigTransactionService } from '../multisig-transaction.service';
import {
  AminoTypes,
  coins,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createGovAminoConverters,
  createStakingAminoConverters,
  makeMultisignedTx,
  StargateClient,
} from '@cosmjs/stargate';
import { fromBase64 } from '@cosmjs/encoding';
import { BaseService } from './base.service';
import { MultisigTransaction } from '../../entities';
import {
  MULTISIG_CONFIRM_STATUS,
  REGISTRY_GENERATED_TYPES,
  TRANSACTION_STATUS,
} from '../../common/constants/app.constant';
import { CustomError } from '../../common/customError';
import {
  IGeneralRepository,
  IMessageRepository,
  IMultisigConfirmRepository,
  IMultisigTransactionsRepository,
  IMultisigWalletOwnerRepository,
  IMultisigWalletRepository,
} from '../../repositories';
import { ConfirmTransactionRequest } from '../../dtos/requests';
import {
  getEvmosAccount,
  makeMultisignedTxEvmos,
  verifyEvmosSig,
} from '../../chains/evmos';
import { CommonUtil } from '../../utils/common.util';
import { makeSignDoc } from '@cosmjs/amino';
import { verifyCosmosSig } from '../../chains';
import { IndexerAPI } from 'src/utils/apis/IndexerAPI';
import { ConfigService } from 'src/shared/services/config.service';

@Injectable()
export class MultisigTransactionService
  extends BaseService
  implements IMultisigTransactionService
{
  private readonly _logger = new Logger(MultisigTransactionService.name);
  private readonly _commonUtil: CommonUtil = new CommonUtil();
  private _indexer = new IndexerAPI(this.configService.get('INDEXER_URL'));

  constructor(
    private configService: ConfigService,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_TRANSACTION_REPOSITORY)
    private multisigTransactionRepos: IMultisigTransactionsRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY)
    private multisigConfirmRepos: IMultisigConfirmRepository,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private chainRepos: IGeneralRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
    private safeRepos: IMultisigWalletRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_OWNER_REPOSITORY)
    private safeOwnerRepo: IMultisigWalletOwnerRepository,
    @Inject(REPOSITORY_INTERFACE.IMESSAGE_REPOSITORY)
    private messageRepos: IMessageRepository,
  ) {
    super(multisigTransactionRepos);
    this._logger.log(
      '============== Constructor Multisig Transaction Service ==============',
    );
  }

  async createTransaction(
    request: MODULE_REQUEST.CreateTransactionRequest,
  ): Promise<ResponseDto> {
    const {
      from,
      to,
      authInfoBytes,
      bodyBytes,
      signature,
      amount,
      internalChainId,
    } = request;
    const res = new ResponseDto();
    try {
      const authInfo = this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;

      // Connect to chain
      const chain = await this.chainRepos.findChain(internalChainId);

      // decode data
      const authInfoEncode = fromBase64(authInfoBytes);
      const decodedAuthInfo = AuthInfo.decode(authInfoEncode);
      const bodyBytesEncode = fromBase64(bodyBytes);
      const { memo, messages } = TxBody.decode(bodyBytesEncode);

      // get accountNumber, sequence from chain
      const { accountNumber, sequence } =
        await this._indexer.getAccountNumberAndSequence(chain.chainId, from);

      // build stdSignDoc for verify signature
      const registry = new Registry(REGISTRY_GENERATED_TYPES);

      // stargate@0.28.11
      const aminoTypes = new AminoTypes({
        ...createBankAminoConverters(),
        ...createStakingAminoConverters(chain.prefix),
        ...createDistributionAminoConverters(),
        ...createGovAminoConverters(),
      });
      const msgs = messages.map((msg: any) => {
        const decoder = registry.lookupType(msg.typeUrl);
        msg.value = decoder.decode(msg.value);
        return aminoTypes.toAmino(msg);
      });
      const stdFee = {
        amount: decodedAuthInfo.fee.amount,
        gas: decodedAuthInfo.fee.gasLimit.toString(),
      };
      const signDoc = makeSignDoc(
        msgs,
        stdFee,
        chain.chainId,
        memo,
        accountNumber,
        sequence,
      );

      // verify signature; if verify fail, throw error
      let resultVerify = false;
      if (chain.chainId.startsWith('evmos_')) {
        resultVerify = await verifyEvmosSig(signature, signDoc, creatorAddress);
      } else {
        resultVerify = await verifyCosmosSig(
          signature,
          signDoc,
          fromBase64(authInfo.pubkey),
        );
      }
      if (!resultVerify) {
        throw new CustomError(ErrorMap.SIGNATURE_VERIFICATION_FAILED);
      }

      // check account balance; if balance is not enough, throw error
      await this.checkAccountBalance(chain.chainId, from, chain.denom, amount);

      // get Safe info
      const safe = await this.safeRepos.getSafe(from, internalChainId);

      // is owner of safe
      await this.safeOwnerRepo.isSafeOwner(creatorAddress, safe.id);

      //Validate safe don't have tx pending
      await this.multisigTransactionRepos.validateCreateTx(
        from,
        internalChainId,
      );

      //Safe data into DB
      const transaction = new MultisigTransaction();
      transaction.fromAddress = from;
      transaction.toAddress = to;
      transaction.amount = amount;
      transaction.gas = decodedAuthInfo.fee.gasLimit.toNumber();
      transaction.fee = Number(decodedAuthInfo.fee.amount[0].amount);
      transaction.accountNumber = accountNumber;
      transaction.typeUrl = messages[0].typeUrl;
      transaction.denom = chain.denom;
      transaction.status = TRANSACTION_STATUS.AWAITING_CONFIRMATIONS;
      transaction.internalChainId = internalChainId;
      transaction.sequence = sequence.toString();
      transaction.safeId = safe.id;
      const transactionResult =
        await this.multisigTransactionRepos.insertMultisigTransaction(
          transaction,
        );

      // save msgs
      await this.messageRepos.saveMsgs(transactionResult.id, messages);

      const requestSign = new ConfirmTransactionRequest();
      requestSign.transactionId = transactionResult.id;
      requestSign.bodyBytes = bodyBytes;
      requestSign.authInfoBytes = authInfoBytes;
      requestSign.signature = signature;
      requestSign.internalChainId = internalChainId;

      //Sign to transaction
      await this.confirmTransaction(requestSign);

      return res.return(ErrorMap.SUCCESSFUL, transactionResult.id, {
        'transactionId:': transactionResult.id,
      });
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async checkAccountBalance(
    chainId: string,
    address: string,
    denom: string,
    expectedBalance: number,
  ): Promise<boolean> {
    const accountInfo = await this._indexer.getAccountInfo(chainId, address);
    const balance = accountInfo.account_balances.filter((item) => {
      return item.denom === denom;
    });
    if (Number(balance.amount) < expectedBalance) {
      throw new CustomError(ErrorMap.BALANCE_NOT_ENOUGH);
    }
    return true;
  }

  async sendTransaction(
    request: MODULE_REQUEST.SendTransactionRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const authInfo = this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;
      const chain = await this.chainRepos.findOne({
        where: { id: request.internalChainId },
      });

      const client = await StargateClient.connect(chain.rpc);

      //get information multisig transaction Id
      const multisigTransaction =
        await this.multisigTransactionRepos.validateTxBroadcast(
          request.transactionId,
        );

      //Validate owner
      await this.multisigConfirmRepos.validateSafeOwner(
        creatorAddress,
        multisigTransaction.fromAddress,
        request.internalChainId,
      );

      //Make tx
      const txBroadcast = await this.makeTx(
        request.transactionId,
        multisigTransaction,
      );

      try {
        //Record owner send transaction
        await this.multisigConfirmRepos.insertIntoMultisigConfirm(
          request.transactionId,
          creatorAddress,
          '',
          '',
          request.internalChainId,
          MULTISIG_CONFIRM_STATUS.SEND,
        );
        await this.safeRepos.updateQueuedTag(multisigTransaction.safeId);

        await client.broadcastTx(txBroadcast, 10);
      } catch (error) {
        console.log('Error', error);
        //Update status and txhash
        //TxHash is encoded transaction when send it to network
        if (typeof error.txId === 'undefined' || error.txId === null) {
          multisigTransaction.status = TRANSACTION_STATUS.FAILED;
          await this.multisigTransactionRepos.update(multisigTransaction);
          return ResponseDto.responseError(
            MultisigTransactionService.name,
            error,
          );
        } else {
          await this.multisigTransactionRepos.updateTxBroadcastSucces(
            multisigTransaction.id,
            error.txId,
          );
          return res.return(ErrorMap.SUCCESSFUL, { TxHash: error.txId });
        }
      }
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async confirmTransaction(
    request: MODULE_REQUEST.ConfirmTransactionRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const {
        transactionId,
        bodyBytes,
        signature,
        authInfoBytes,
        internalChainId,
      } = request;
      const authInfo = this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;

      // Connect to chain
      const chain = await this.chainRepos.findChain(internalChainId);

      // get tx
      const pendingTx =
        await this.multisigTransactionRepos.getTransactionDetailsMultisigTransaction(
          {
            id: transactionId,
          },
        );

      // decode data
      const authInfoEncode = fromBase64(authInfoBytes);
      const decodedAuthInfo = AuthInfo.decode(authInfoEncode);
      const bodyBytesEncode = fromBase64(bodyBytes);
      const { memo, messages } = TxBody.decode(bodyBytesEncode);

      // get accountNumber, sequence from chain
      const { accountNumber, sequence } =
        await this._indexer.getAccountNumberAndSequence(
          chain.chainId,
          pendingTx.FromAddress,
        );

      // build stdSignDoc for verify signature
      const registry = new Registry(REGISTRY_GENERATED_TYPES);

      // stargate@0.28.11
      const aminoTypes = new AminoTypes({
        ...createBankAminoConverters(),
        ...createStakingAminoConverters(chain.prefix),
        ...createDistributionAminoConverters(),
        ...createGovAminoConverters(),
      });
      const msgs = messages.map((msg: any) => {
        const decoder = registry.lookupType(msg.typeUrl);
        msg.value = decoder.decode(msg.value);
        return aminoTypes.toAmino(msg);
      });
      const stdFee = {
        amount: decodedAuthInfo.fee.amount,
        gas: decodedAuthInfo.fee.gasLimit.toString(),
      };
      const signDoc = makeSignDoc(
        msgs,
        stdFee,
        chain.chainId,
        memo,
        accountNumber,
        sequence,
      );

      // verify signature; if verify fail, throw error
      let resultVerify = false;
      if (chain.chainId.startsWith('evmos_')) {
        resultVerify = await verifyEvmosSig(signature, signDoc, creatorAddress);
      } else {
        resultVerify = await verifyCosmosSig(
          signature,
          signDoc,
          fromBase64(authInfo.pubkey),
        );
      }
      if (!resultVerify) {
        throw new CustomError(ErrorMap.SIGNATURE_VERIFICATION_FAILED);
      }

      const transaction =
        await this.multisigTransactionRepos.checkExistMultisigTransaction(
          request.transactionId,
        );

      await this.multisigConfirmRepos.validateSafeOwner(
        creatorAddress,
        transaction.fromAddress,
        request.internalChainId,
      );

      //User has confirmed transaction before
      await this.multisigConfirmRepos.checkUserHasSigned(
        request.transactionId,
        creatorAddress,
      );

      await this.multisigConfirmRepos.insertIntoMultisigConfirm(
        request.transactionId,
        creatorAddress,
        request.signature,
        request.bodyBytes,
        request.internalChainId,
        MULTISIG_CONFIRM_STATUS.CONFIRM,
      );

      await this.multisigTransactionRepos.validateTransaction(
        request.transactionId,
        request.internalChainId,
      );

      await this.safeRepos.updateQueuedTag(transaction.safeId);

      return res.return(ErrorMap.SUCCESSFUL);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async rejectTransaction(
    request: MODULE_REQUEST.RejectTransactionParam,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const authInfo = this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;
      //Check status of multisig transaction when reject transaction
      const transaction =
        await this.multisigTransactionRepos.checkExistMultisigTransaction(
          request.transactionId,
        );

      //Validate owner
      await this.multisigConfirmRepos.validateSafeOwner(
        creatorAddress,
        transaction.fromAddress,
        request.internalChainId,
      );

      //Check user has rejected transaction before
      await this.multisigConfirmRepos.checkUserHasSigned(
        request.transactionId,
        creatorAddress,
      );

      await this.multisigConfirmRepos.insertIntoMultisigConfirm(
        request.transactionId,
        creatorAddress,
        '',
        '',
        request.internalChainId,
        MULTISIG_CONFIRM_STATUS.REJECT,
      );

      const rejectConfirms = await this.multisigConfirmRepos.findByCondition({
        multisigTransactionId: request.transactionId,
        status: MULTISIG_CONFIRM_STATUS.REJECT,
      });

      const safeOwner = await this.safeOwnerRepo.findByCondition({
        safeId: transaction.safeId,
      });

      const safe = await this.safeRepos.findOne({
        where: { id: transaction.safeId },
      });

      if (safeOwner.length - rejectConfirms.length < safe.threshold) {
        transaction.status = TRANSACTION_STATUS.CANCELLED;
        await this.multisigTransactionRepos.update(transaction);
      }

      await this.safeRepos.updateQueuedTag(transaction.safeId);

      return res.return(ErrorMap.SUCCESSFUL);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async signingInstruction(
    internalChainId: number,
    sendAddress: string,
    amount: number,
  ): Promise<any> {
    const chain = await this.chainRepos.findChain(internalChainId);

    await this.checkAccountBalance(
      chain.chainId,
      sendAddress,
      chain.denom,
      amount,
    );

    //Check account
    const { accountNumber, sequence } =
      await this._indexer.getAccountNumberAndSequence(
        chain.chainId,
        sendAddress,
      );
    return {
      accountNumber,
      sequence,
      chainId: chain.chainId,
      denom: chain.denom,
    };
  }

  async makeTx(
    transactionId: number,
    multisigTransaction: MultisigTransaction,
  ): Promise<any> {
    //Get safe info
    const safeInfo = await this.safeRepos.findOne({
      where: { id: multisigTransaction.safeId },
    });

    const chain = await this.chainRepos.findChain(safeInfo.internalChainId);

    //Get all signature of transaction
    const multisigConfirmArr = await this.multisigConfirmRepos.findByCondition({
      multisigTransactionId: transactionId,
      status: MULTISIG_CONFIRM_STATUS.CONFIRM,
    });

    const addressSignarureMap = new Map<string, Uint8Array>();

    multisigConfirmArr.forEach((x) => {
      const encodeSignature = fromBase64(x.signature);
      addressSignarureMap.set(x.ownerAddress, encodeSignature);
    });

    //Fee
    const sendFee = {
      amount: coins(
        multisigTransaction.fee.toString(),
        multisigTransaction.denom,
      ),
      gas: multisigTransaction.gas.toString(),
    };

    const encodedBodyBytes = fromBase64(multisigConfirmArr[0].bodyBytes);

    //Pubkey
    const safePubkey = JSON.parse(safeInfo.safePubkey);

    let executeTransaction;
    if (chain.denom === 'atevmos') {
      executeTransaction = makeMultisignedTxEvmos(
        safePubkey,
        Number(multisigTransaction.sequence),
        sendFee,
        encodedBodyBytes,
        addressSignarureMap,
      );
    } else {
      executeTransaction = makeMultisignedTx(
        safePubkey,
        Number(multisigTransaction.sequence),
        sendFee,
        encodedBodyBytes,
        addressSignarureMap,
      );
    }

    const encodeTransaction = Uint8Array.from(
      TxRaw.encode(executeTransaction).finish(),
    );
    return encodeTransaction;
  }
}
