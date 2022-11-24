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
  isAminoMsgBeginRedelegate,
  isAminoMsgDelegate,
  isAminoMsgMultiSend,
  isAminoMsgSend,
  isAminoMsgUndelegate,
  makeMultisignedTx,
  StargateClient,
} from '@cosmjs/stargate';
import { fromBase64 } from '@cosmjs/encoding';
import { BaseService } from './base.service';
import { Chain, MultisigTransaction, Safe } from '../../entities';
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
import { makeMultisignedTxEvmos, verifyEvmosSig } from '../../chains/evmos';
import { CommonUtil } from '../../utils/common.util';
import { AminoMsg, makeSignDoc } from '@cosmjs/amino';
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

  async createMultisigTransaction(
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
      accountNumber,
      sequence,
    } = request;
    try {
      const authInfo = this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;

      // get chain info
      const chain = await this.chainRepos.findChain(internalChainId);

      // decode data
      const { decodedAuthInfo, messages, aminoMsgs } = await this.decodeAndVerifyTxInfo(
        authInfoBytes,
        bodyBytes,
        signature,
        chain.chainId,
        chain.prefix,
        authInfo.address,
        authInfo.pubkey,
        accountNumber,
        sequence,
        from,
      );

      // calculate amount
      const amount = this.calculateAmount(aminoMsgs);

      // check account balance; if balance is not enough, throw error
      await this.checkAccountBalance(chain.chainId, from, chain.denom, amount);

      // get safe info
      const safe = await this.safeRepos.getSafe(from, internalChainId);

      // is owner of safe
      await this.safeOwnerRepo.isSafeOwner(creatorAddress, safe.id);

      //Validate safe don't have tx pending
      await this.multisigTransactionRepos.validateCreateTx(
        from,
        internalChainId,
      );

      // save tx
      const transaction = new MultisigTransaction();
      transaction.fromAddress = from;
      transaction.toAddress = to || '';
      transaction.amount = amount > 0 ? amount : undefined;
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

      // confirm tx
      await this.confirmTx(
        transactionResult.id,
        creatorAddress,
        signature,
        bodyBytes,
        internalChainId,
        transaction.safeId,
      );

      return ResponseDto.response(ErrorMap.SUCCESSFUL, {
        transactionId: transactionResult.id,
      });
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async confirmMultisigTransaction(
    request: MODULE_REQUEST.ConfirmTransactionRequest,
  ): Promise<ResponseDto> {
    try {
      const {
        transactionId,
        bodyBytes,
        signature,
        authInfoBytes,
        internalChainId,
        accountNumber,
        sequence,
      } = request;
      const authInfo = this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;

      // Connect to chain
      const chain = await this.chainRepos.findChain(internalChainId);

      // get tx
      const pendingTx = await this.multisigTransactionRepos.getTransactionById(
        transactionId,
      );

      // verify data
      await this.decodeAndVerifyTxInfo(
        authInfoBytes,
        bodyBytes,
        signature,
        chain.chainId,
        chain.prefix,
        authInfo.address,
        authInfo.pubkey,
        accountNumber,
        sequence,
        pendingTx.fromAddress,
      );

      await this.multisigConfirmRepos.validateSafeOwner(
        creatorAddress,
        pendingTx.fromAddress,
        internalChainId,
      );

      await this.confirmTx(
        transactionId,
        creatorAddress,
        signature,
        bodyBytes,
        internalChainId,
        pendingTx.safeId,
      );

      return ResponseDto.response(ErrorMap.SUCCESSFUL);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async sendMultisigTransaction(
    request: MODULE_REQUEST.SendTransactionRequest,
  ): Promise<ResponseDto> {
    try {
      const { internalChainId, transactionId } = request;
      const authInfo = this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;

      const chain = await this.chainRepos.findChain(internalChainId);
      let client: StargateClient;
      try {
        client = await StargateClient.connect(chain.rpc);
      } catch (error) {
        throw new CustomError(ErrorMap.CANNOT_CONNECT_TO_CHAIN, error.message);
      }

      // get tx
      const multisigTransaction =
        await this.multisigTransactionRepos.getBroadcastableTx(transactionId);

      // get safe & validate safe owner
      const safe = await this.safeRepos.getSafe(
        multisigTransaction.fromAddress,
        internalChainId,
      );
      await this.safeOwnerRepo.isSafeOwner(creatorAddress, safe.id);

      // Make tx
      const txBroadcast = await this.makeTx(safe, chain, multisigTransaction);

      // Record owner send transaction
      await this.multisigConfirmRepos.insertIntoMultisigConfirm(
        request.transactionId,
        creatorAddress,
        '',
        '',
        internalChainId,
        MULTISIG_CONFIRM_STATUS.SEND,
      );
      await this.safeRepos.updateQueuedTag(multisigTransaction.safeId);

      try {
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
          await this.multisigTransactionRepos.updateTxBroadcastSuccess(
            multisigTransaction.id,
            error.txId,
          );
          return ResponseDto.response(ErrorMap.SUCCESSFUL, {
            TxHash: error.txId,
          });
        }
      }
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async rejectMultisigTransaction(
    request: MODULE_REQUEST.RejectTransactionParam,
  ): Promise<ResponseDto> {
    const { transactionId, internalChainId } = request;
    try {
      const authInfo = this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;
      //Check status of multisig transaction when reject transaction
      const transaction =
        await this.multisigTransactionRepos.getTransactionById(transactionId);

      // Get safe
      const safe = await this.safeRepos.getSafe(
        transaction.fromAddress,
        internalChainId,
      );
      await this.safeOwnerRepo.isSafeOwner(creatorAddress, safe.id);

      //Check user has rejected transaction before
      await this.multisigConfirmRepos.checkUserHasSigned(
        transactionId,
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

      // count number of reject
      const rejectConfirms = await this.multisigConfirmRepos.findByCondition({
        multisigTransactionId: request.transactionId,
        status: MULTISIG_CONFIRM_STATUS.REJECT,
      });

      // count number of owner
      const safeOwner = await this.safeOwnerRepo.findByCondition({
        safeId: transaction.safeId,
      });

      // if number of reject > number of owner / 2 => reject transaction
      if (safeOwner.length - rejectConfirms.length < safe.threshold) {
        transaction.status = TRANSACTION_STATUS.CANCELLED;
        await this.multisigTransactionRepos.update(transaction);
      }

      // update queued tag
      await this.safeRepos.updateQueuedTag(transaction.safeId);

      return ResponseDto.response(ErrorMap.SUCCESSFUL);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  private async decodeAndVerifyTxInfo(
    authInfoBytes: string,
    bodyBytes: string,
    signature: string,
    chainId: string,
    prefix: string,
    creatorAddress: string,
    creatorPubkey: string,
    accountNumber: number,
    sequence: number,
    safeAddress: string,
  ) {
    const authInfoEncode = fromBase64(authInfoBytes);
    const decodedAuthInfo = AuthInfo.decode(authInfoEncode);
    const bodyBytesEncode = fromBase64(bodyBytes);
    const { memo, messages } = TxBody.decode(bodyBytesEncode);

    if (accountNumber === undefined || sequence === undefined) {
      const account = await this._indexer.getAccountNumberAndSequence(
        chainId,
        safeAddress,
      );
      accountNumber = account.accountNumber;
      sequence = account.sequence;
    }
    // get accountNumber, sequence from chain
    // const { accountNumber, sequence } =
    //   await this._indexer.getAccountNumberAndSequence(chainId, safeAddress);

    // build stdSignDoc for verify signature
    const registry = new Registry(REGISTRY_GENERATED_TYPES);

    // stargate@0.28.11
    const aminoTypes = new AminoTypes({
      ...createBankAminoConverters(),
      ...createStakingAminoConverters(prefix),
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
      chainId,
      memo,
      accountNumber,
      sequence,
    );

    // verify signature; if verify fail, throw error
    let resultVerify = false;
    if (chainId.startsWith('evmos_')) {
      resultVerify = await verifyEvmosSig(signature, signDoc, creatorAddress);
    } else {
      resultVerify = await verifyCosmosSig(
        signature,
        signDoc,
        fromBase64(creatorPubkey),
      );
    }
    if (!resultVerify) {
      throw new CustomError(ErrorMap.SIGNATURE_VERIFICATION_FAILED);
    }

    return {
      decodedAuthInfo,
      messages,
      aminoMsgs: msgs
    };
  }

  private async checkAccountBalance(
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

  private async confirmTx(
    transactionId: number,
    ownerAddress: string,
    signature: string,
    bodyBytes: string,
    internalChainId: number,
    safeId: number,
  ) {
    // if user has confirmed transaction before then return
    await this.multisigConfirmRepos.checkUserHasSigned(
      transactionId,
      ownerAddress,
    );

    // insert into multisig confirm table
    await this.multisigConfirmRepos.insertIntoMultisigConfirm(
      transactionId,
      ownerAddress,
      signature,
      bodyBytes,
      internalChainId,
      MULTISIG_CONFIRM_STATUS.CONFIRM,
    );

    // update tx status to waiting execute if all owner has confirmed
    await this.multisigTransactionRepos.updateTxStatusIfSatisfied(
      transactionId,
      safeId,
      internalChainId,
    );

    // update queued tag
    await this.safeRepos.updateQueuedTag(safeId);
  }

  // async signingInstruction(
  //   internalChainId: number,
  //   sendAddress: string,
  //   amount: number,
  // ): Promise<any> {
  //   const chain = await this.chainRepos.findChain(internalChainId);

  //   await this.checkAccountBalance(
  //     chain.chainId,
  //     sendAddress,
  //     chain.denom,
  //     amount,
  //   );

  //   //Check account
  //   const { accountNumber, sequence } =
  //     await this._indexer.getAccountNumberAndSequence(
  //       chain.chainId,
  //       sendAddress,
  //     );
  //   return {
  //     accountNumber,
  //     sequence,
  //     chainId: chain.chainId,
  //     denom: chain.denom,
  //   };
  // }

  async makeTx(
    safeInfo: Safe,
    chainInfo: Chain,
    multisigTransaction: MultisigTransaction,
  ): Promise<any> {
    // Get all signature of transaction
    const multisigConfirmArr = await this.multisigConfirmRepos.findByCondition({
      multisigTransactionId: multisigTransaction.id,
      status: MULTISIG_CONFIRM_STATUS.CONFIRM,
    });

    const addressSignarureMap = new Map<string, Uint8Array>();

    multisigConfirmArr.forEach((x) => {
      const encodeSignature = fromBase64(x.signature);
      addressSignarureMap.set(x.ownerAddress, encodeSignature);
    });

    // Fee
    const sendFee = {
      amount: coins(
        multisigTransaction.fee.toString(),
        multisigTransaction.denom,
      ),
      gas: multisigTransaction.gas.toString(),
    };

    const encodedBodyBytes = fromBase64(multisigConfirmArr[0].bodyBytes);

    // Pubkey
    const safePubkey = JSON.parse(safeInfo.safePubkey);

    let executeTransaction;
    if (chainInfo.chainId.startsWith('evmos_')) {
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

  calculateAmount(aminoMsgs: AminoMsg[]): number {
    return aminoMsgs.reduce((acc, cur) => {
      switch (true) {
        case isAminoMsgSend(cur):
          return acc + Number(cur.value.amount[0].amount);
        case isAminoMsgMultiSend(cur):
          return acc + cur.value.outputs.reduce((acc, cur) => acc + Number(cur.coins[0].amount), 0);
        case isAminoMsgDelegate(cur):
        case isAminoMsgBeginRedelegate(cur):
        case isAminoMsgUndelegate(cur):
          return acc + Number(cur.value.amount.amount);
        default:
          return acc;
      }
    }, 0)
  }
}
