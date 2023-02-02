import { Registry } from '@cosmjs/proto-signing';
import { AuthInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from '../../dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { IMultisigTransactionService } from '../imultisig-transaction.service';
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
  SAFE_STATUS,
  TRANSACTION_STATUS,
} from '../../common/constants/app.constant';

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
import { IndexerClient } from '../../utils/apis/IndexerClient';
import { Simulate } from '../../simulate';
import { ConfigService } from '../../shared/services/config.service';
import { INotificationRepository } from '../../repositories/inotification.repository';
import { CustomError } from '../../common/customError';
import { AccountInfo, TxRawInfo } from '../../dtos/requests';
import { UserInfo } from '../../dtos/userInfo';
import { CosmosUtil } from '../../chains/cosmos';

@Injectable()
export class MultisigTransactionService
  extends BaseService
  implements IMultisigTransactionService
{
  private readonly _logger = new Logger(MultisigTransactionService.name);
  private readonly _commonUtil: CommonUtil = new CommonUtil();
  private _indexer = new IndexerClient(this.configService.get('INDEXER_URL'));
  private _simulate: Simulate;

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
    @Inject(REPOSITORY_INTERFACE.INOTIFICATION_REPOSITORY)
    private notificationRepo: INotificationRepository,
  ) {
    super(multisigTransactionRepos);
    this._logger.log(
      '============== Constructor Multisig Transaction Service ==============',
    );

    this._simulate = new Simulate(this.configService.get('SYS_MNEMONIC'));
  }

  async changeSequence(
    request: MODULE_REQUEST.ChangeSequenceTransactionRequest,
  ): Promise<ResponseDto> {
    const {
      from,
      to,
      authInfoBytes,
      bodyBytes,
      signature,
      internalChainId,
      accountNumber,
      sequence,
      oldTxId,
    } = request;

    // delete old tx
    const requestDeleteTx: MODULE_REQUEST.DeleteTxRequest = {
      id: oldTxId,
    };
    const deleted = await this.deleteTransaction(requestDeleteTx);
    if (deleted.ErrorCode !== ErrorMap.SUCCESSFUL.Code) {
      return deleted;
    }

    // create new tx
    const requestCreateTx: MODULE_REQUEST.CreateTransactionRequest = {
      from,
      to,
      authInfoBytes,
      bodyBytes,
      signature,
      internalChainId,
      accountNumber,
      sequence,
    };
    const created = await this.createMultisigTransaction(requestCreateTx);
    if (deleted.ErrorCode !== ErrorMap.SUCCESSFUL.Code) {
      throw new CustomError(ErrorMap[deleted.ErrorCode], deleted.Data);
    }
    return created;
  }

  async deleteTransaction(
    request: MODULE_REQUEST.DeleteTxRequest,
  ): Promise<ResponseDto> {
    try {
      const { id } = request;
      const authInfo = this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;

      // check tx status
      const tx = await this.multisigTransactionRepos.getTransactionById(id);
      if (tx.status !== TRANSACTION_STATUS.AWAITING_CONFIRMATIONS)
        throw new CustomError(ErrorMap.CANNOT_DELETE_TX);

      await this.deleteTx(tx, creatorAddress);

      // notify to all owners except the one who deletes the transaction
      const safeOwners = await this.safeOwnerRepo.getSafeOwnersWithError(
        tx.safeId,
      );
      await this.notificationRepo.notifyDeletedTx(
        tx.safeId,
        tx.fromAddress,
        tx.id,
        Number(tx.sequence),
        safeOwners
          .filter((safeOwner) => safeOwner.ownerAddress !== creatorAddress)
          .map((safeOwner) => safeOwner.ownerAddress),
        creatorAddress,
        tx.internalChainId,
      );

      return ResponseDto.response(ErrorMap.SUCCESSFUL);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async simulate(
    request: MODULE_REQUEST.SimulateTxRequest,
  ): Promise<ResponseDto> {
    try {
      const { encodedMsgs, safeId } = request;
      const messages = JSON.parse(
        Buffer.from(encodedMsgs, 'base64').toString('binary'),
      );

      // get safe info
      const safeInfo = await this.safeRepos.getSafe(safeId.toString());
      if (safeInfo.status !== SAFE_STATUS.CREATED)
        throw new CustomError(ErrorMap.INVALID_SAFE);

      // get chain info
      const chain = await this.chainRepos.findChain(safeInfo.internalChainId);
      const wallet = await this._simulate.simulateWithChain(chain);

      const result = await wallet.simulate(messages, safeInfo);
      return ResponseDto.response(ErrorMap.SUCCESSFUL, result);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async getSimulateAddresses(
    request: MODULE_REQUEST.GetSimulateAddressQuery,
  ): Promise<ResponseDto> {
    const { internalChainId } = request;
    const chain = await this.chainRepos.findChain(internalChainId);
    const wallet = await this._simulate.simulateWithChain(chain);
    return ResponseDto.response(ErrorMap.SUCCESSFUL, wallet.getAddresses());
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
      internalChainId,
      sequence,
    } = request;
    try {
      const authInfo = this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;

      // get safe info
      const safe = await this.safeRepos.getSafe(from, internalChainId);

      // get chain info
      const chain = await this.chainRepos.findChain(internalChainId);

      // get safe account info
      const accountInfo: AccountInfo = await this.getAccountInfoWithNewSeq(
        sequence,
        safe,
        chain.chainId,
      );

      const txRawInfo: TxRawInfo = {
        authInfoBytes,
        bodyBytes,
        signature,
      };

      // decode data
      const { decodedAuthInfo, messages, aminoMsgs } =
        await this.decodeAndVerifyTxInfo(
          txRawInfo,
          accountInfo,
          chain,
          authInfo,
        );

      // calculate amount
      const amount = this.calculateAmount(aminoMsgs);

      // check account balance; if balance is not enough, throw error
      await this.checkAccountBalance(chain.chainId, from, chain.denom, amount);

      // is owner of safe
      await this.safeOwnerRepo.isSafeOwner(creatorAddress, safe.id);

      // save tx
      const transaction = new MultisigTransaction();
      transaction.fromAddress = from;
      transaction.toAddress = to || '';
      transaction.amount = amount > 0 ? amount : undefined;
      transaction.gas = decodedAuthInfo.fee.gasLimit.toNumber();
      transaction.fee = Number(decodedAuthInfo.fee.amount[0].amount);
      transaction.accountNumber = accountInfo.accountNumber;
      transaction.typeUrl = messages[0].typeUrl;
      transaction.denom = chain.denom;
      transaction.status = TRANSACTION_STATUS.AWAITING_CONFIRMATIONS;
      transaction.internalChainId = internalChainId;
      transaction.sequence = accountInfo.sequence.toString();
      transaction.safeId = safe.id;
      const transactionResult =
        await this.multisigTransactionRepos.insertMultisigTransaction(
          transaction,
        );

      // save msgs
      await this.messageRepos.saveMsgs(transactionResult.id, messages);

      // confirm tx
      await this.confirmTx(
        transactionResult,
        creatorAddress,
        signature,
        bodyBytes,
        internalChainId,
        safe,
      );

      // save account number & next queue sequence
      const { sequence: sequenceInIndexer } =
        await this._indexer.getAccountNumberAndSequence(
          chain.chainId,
          safe.safeAddress,
        );
      safe.nextQueueSeq = (
        await this.calculateNextSeq(safe.id, sequenceInIndexer)
      ).toString();
      safe.accountNumber = accountInfo.accountNumber.toString();
      await this.safeRepos.updateSafe(safe);

      // notify to another owners
      const safeOwners = await this.safeOwnerRepo.getSafeOwnersWithError(
        safe.id,
      );
      await this.notificationRepo.notifyNewTx(
        safe.id,
        safe.safeAddress,
        transactionResult.id,
        transactionResult.sequence,
        creatorAddress,
        safeOwners
          .filter((safeOwner) => safeOwner.ownerAddress !== creatorAddress)
          .map((safeOwner) => safeOwner.ownerAddress),
        internalChainId,
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

      // get safe info
      const safe = await this.safeRepos.getSafe(
        pendingTx.fromAddress,
        internalChainId,
      );

      const accountInfo: AccountInfo = await this.getAccountInfoWithNewSeq(
        sequence,
        safe,
        chain.chainId,
      );

      const txRawInfo: TxRawInfo = {
        authInfoBytes,
        bodyBytes,
        signature,
      };

      // verify data
      await this.decodeAndVerifyTxInfo(txRawInfo, accountInfo, chain, authInfo);

      await this.multisigConfirmRepos.validateSafeOwner(
        creatorAddress,
        pendingTx.fromAddress,
        internalChainId,
      );

      await this.confirmTx(
        pendingTx,
        creatorAddress,
        signature,
        bodyBytes,
        internalChainId,
        safe,
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
      } catch (error) {}

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

          // re calculate next seq
          safe.nextQueueSeq = (
            await this.calculateNextSeq(
              safe.id,
              Number(multisigTransaction.sequence),
            )
          ).toString();
          await this.safeRepos.updateSafe(safe);

          return ResponseDto.responseError(
            MultisigTransactionService.name,
            error,
          );
        } else {
          // update tx status to "pending"
          await this.multisigTransactionRepos.updateTxBroadcastSuccess(
            multisigTransaction.id,
            error.txId,
          );

          // update queue tx have same sequence to "replaced"
          await this.multisigTransactionRepos.updateQueueTxToReplaced(
            multisigTransaction.safeId,
            Number(multisigTransaction.sequence),
          );

          // update safe next queue sequence
          safe.sequence = (Number(multisigTransaction.sequence) + 1).toString();
          safe.nextQueueSeq = (
            await this.calculateNextSeq(
              safe.id,
              Number(multisigTransaction.sequence) + 1,
            )
          ).toString();

          // notify tx broadcasted
          const safeOwners = await this.safeOwnerRepo.getSafeOwnersWithError(
            safe.id,
          );
          await this.notificationRepo.notifyBroadcastedTx(
            safe.id,
            safe.safeAddress,
            multisigTransaction.id,
            Number(multisigTransaction.sequence),
            safeOwners.map((safeOwner) => safeOwner.ownerAddress),
            internalChainId,
          );
          await this.safeRepos.updateSafe(safe);

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
    txRawInfo: TxRawInfo,
    accountInfo: AccountInfo,
    chain: Chain,
    creatorInfo: UserInfo,
  ) {
    const { chainId, prefix } = chain;
    const { address: creatorAddress, pubkey: creatorPubkey } = creatorInfo;

    const authInfoEncode = fromBase64(txRawInfo.authInfoBytes);
    const decodedAuthInfo = AuthInfo.decode(authInfoEncode);
    const bodyBytesEncode = fromBase64(txRawInfo.bodyBytes);
    const { memo, messages } = TxBody.decode(bodyBytesEncode);

    const { accountNumber, sequence } = accountInfo;

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
      resultVerify = await verifyEvmosSig(
        txRawInfo.signature,
        signDoc,
        creatorAddress,
      );
    } else {
      resultVerify = await CosmosUtil.verifyCosmosSig(
        txRawInfo.signature,
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
      aminoMsgs: msgs,
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
    transaction: MultisigTransaction,
    ownerAddress: string,
    signature: string,
    bodyBytes: string,
    internalChainId: number,
    safe: Safe,
  ) {
    // if user has confirmed transaction before then return
    await this.multisigConfirmRepos.checkUserHasSigned(
      transaction.id,
      ownerAddress,
    );

    // insert into multisig confirm table
    await this.multisigConfirmRepos.insertIntoMultisigConfirm(
      transaction.id,
      ownerAddress,
      signature,
      bodyBytes,
      internalChainId,
      MULTISIG_CONFIRM_STATUS.CONFIRM,
    );

    // update tx status to waiting execute if all owner has confirmed
    const isExecutable = await this.multisigTransactionRepos.isExecutable(
      transaction.id,
      safe.id,
      internalChainId,
    );

    if (isExecutable) {
      await this.multisigTransactionRepos.updateAwaitingExecutionTx(
        transaction.id,
      );

      // notify tx ready to execute
      const safeOwners = await this.safeOwnerRepo.getSafeOwnersWithError(
        safe.id,
      );
      await this.notificationRepo.notifyExecutableTx(
        safe.id,
        safe.safeAddress,
        transaction.id,
        Number(transaction.sequence),
        safeOwners.map((safeOwner) => safeOwner.ownerAddress),
        internalChainId,
      );
    }

    // update queued tag
    await this.safeRepos.updateQueuedTag(safe.id);
  }

  async deleteTx(tx: MultisigTransaction, userAddress: string) {
    // check user is owner
    await this.safeOwnerRepo.isSafeOwner(userAddress, tx.safeId);

    // delete tx
    await this.multisigTransactionRepos.deleteTx(tx.id);

    // update queued tag
    await this.safeRepos.updateQueuedTagByAddress(tx.fromAddress);
  }

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
          return (
            acc +
            cur.value.outputs.reduce(
              (acc, cur) => acc + Number(cur.coins[0].amount),
              0,
            )
          );
        case isAminoMsgDelegate(cur):
        case isAminoMsgBeginRedelegate(cur):
        case isAminoMsgUndelegate(cur):
          return acc + Number(cur.value.amount.amount);
        default:
          return acc;
      }
    }, 0);
  }

  /**
   * Get account number & seq from db if not provided; if db not found, get from indexer
   *
   * @param sequence
   * @param safe
   * @param chainId
   * @returns
   */
  async getAccountInfoWithNewSeq(
    sequence: number,
    safe: Safe,
    chainId: string,
  ): Promise<AccountInfo> {
    const accountInfo: AccountInfo = {
      accountNumber: 0,
      sequence: 0,
    };

    if (safe.accountNumber !== null && safe.nextQueueSeq !== null) {
      accountInfo.accountNumber = Number(safe.accountNumber);
      accountInfo.sequence = sequence || Number(safe.nextQueueSeq);
      return accountInfo;
    }

    const account = await this._indexer.getAccountNumberAndSequence(
      chainId,
      safe.safeAddress,
    );
    accountInfo.accountNumber = account.accountNumber;
    accountInfo.sequence = account.sequence;

    return accountInfo;
  }

  async calculateNextSeq(
    safeId: number,
    currentSequence: number,
  ): Promise<number> {
    const queueSequences =
      await this.multisigTransactionRepos.findSequenceInQueue(safeId);

    let nextSeq = currentSequence;
    for (const i in queueSequences) {
      if (queueSequences[i] !== nextSeq) {
        break;
      }
      nextSeq++;
    }
    return nextSeq;
  }
}
