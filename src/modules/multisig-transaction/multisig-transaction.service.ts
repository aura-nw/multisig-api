import { Registry } from '@cosmjs/proto-signing';
import { AuthInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from '../../dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
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
import {
  MULTISIG_CONFIRM_STATUS,
  REGISTRY_GENERATED_TYPES,
  SAFE_STATUS,
  TRANSACTION_STATUS,
  TRANSFER_DIRECTION,
  TX_TYPE_URL,
} from '../../common/constants/app.constant';

import { makeMultisignedTxEvmos, verifyEvmosSig } from '../../chains/evmos';
import { CommonUtil } from '../../utils/common.util';
import { AminoMsg, makeSignDoc } from '@cosmjs/amino';
import { IndexerClient } from '../../utils/apis/indexer-client.service';
import { Simulate } from '../../simulate';
import { ConfigService } from '../../shared/services/config.service';
import { CustomError } from '../../common/customError';
import { UserInfo } from '../../dtos/userInfo';
import { CosmosUtil } from '../../chains/cosmos';
import { MultisigTransactionRepository } from './multisig-transaction.repository';
import { MultisigConfirmRepository } from '../multisig-confirm/multisig-confirm.repository';
import { ChainRepository } from '../chain/chain.repository';
import { SafeRepository } from '../safe/safe.repository';
import { SafeOwnerRepository } from '../safe-owner/safe-owner.repository';
import { MessageRepository } from '../message/message.repository';
import { NotificationRepository } from '../notification/notification.repository';
import { ChangeSequenceTransactionRequestDto } from './dto/request/change-seq.req';
import { ConfirmTransactionRequestDto } from './dto/request/confirm-transaction.req';
import { TxDetailDto } from './dto/response/tx-detail.res';
import { AuraTxRepository } from '../aura-tx/aura-tx.repository';
import { TxMessageResponseDto } from '../message/dto/response/tx-message.res';
import { plainToInstance } from 'class-transformer';
import { CreateTransactionRequestDto } from './dto/request/create-transaction.req';
import {
  GetAllTransactionsRequestDto,
  GetMultisigSignaturesParamDto,
  GetSimulateAddressQueryDto,
  GetTxDetailQueryDto,
  MultisigTransactionHistoryResponseDto,
  RejectTransactionRequestDto,
  SendTransactionRequestDto,
  SimulateTxRequestDto,
} from './dto';
import { DeleteTxRequestDto } from './dto/request/delete-tx.req';
import { MultisigTransaction } from './entities/multisig-transaction.entity';
import { Chain } from '../chain/entities/chain.entity';
import { Safe } from '../safe/entities/safe.entity';
import { TransactionHistoryRepository } from '../transaction-history/transaction-history.repository';
import { AccountInfo } from '../../dtos/requests/account';
import { TxRawInfo } from '../../dtos/requests/transaction';

@Injectable()
export class MultisigTransactionService {
  private readonly _logger = new Logger(MultisigTransactionService.name);
  private readonly _commonUtil: CommonUtil = new CommonUtil();
  private _indexer = new IndexerClient(this.configService.get('INDEXER_URL'));
  private readonly utils: CommonUtil = new CommonUtil();
  private _simulate: Simulate;

  constructor(
    private configService: ConfigService,
    private multisigTransactionRepos: MultisigTransactionRepository,
    private auraTxRepo: AuraTxRepository,
    private multisigConfirmRepos: MultisigConfirmRepository,
    private chainRepos: ChainRepository,
    private safeRepos: SafeRepository,
    private safeOwnerRepo: SafeOwnerRepository,
    private messageRepos: MessageRepository,
    private notificationRepo: NotificationRepository,
    private txHistoryRepo: TransactionHistoryRepository,
  ) {
    this._logger.log(
      '============== Constructor Multisig Transaction Service ==============',
    );

    this._simulate = new Simulate(this.configService.get('SYS_MNEMONIC'));
  }

  async getTransactionHistory(
    request: GetAllTransactionsRequestDto,
  ): Promise<ResponseDto> {
    const { safeAddress, isHistory, pageSize, pageIndex, internalChainId } =
      request;

    try {
      const safe = await this.safeRepos.getSafeByAddress(
        safeAddress,
        internalChainId,
      );

      let result: MultisigTransactionHistoryResponseDto[];
      if (isHistory)
        result = await this.txHistoryRepo.getTxHistoryBySafeAddress(
          safeAddress,
          internalChainId,
          pageIndex,
          pageSize,
        );
      else {
        const txs = await this.multisigTransactionRepos.getQueueTransaction(
          safeAddress,
          internalChainId,
          pageIndex,
          pageSize,
        );
        result = await this.getConfirmationStatus(txs, safe[0].threshold);
      }
      const response = result.map((item) => {
        if (item.TypeUrl === null || item.FromAddress !== safeAddress)
          item.TypeUrl = TX_TYPE_URL.RECEIVE;

        item.Direction = this.getDirection(
          item.TypeUrl,
          item.FromAddress,
          safeAddress,
        );

        item.FinalAmount =
          item.MultisigTxAmount || item.AuraTxAmount || item.AuraTxRewardAmount;

        if (!Number.isNaN(Number(item.Status))) {
          item.Status = this.parseStatus(item.Status);
        }
        return item;
      });
      return ResponseDto.response(ErrorMap.SUCCESSFUL, response);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  getDirection(typeUrl: string, from: string, safeAddress: string): string {
    switch (typeUrl) {
      case TX_TYPE_URL.SEND:
      case TX_TYPE_URL.MULTI_SEND:
        return from === safeAddress
          ? TRANSFER_DIRECTION.OUTGOING
          : TRANSFER_DIRECTION.INCOMING;
      case TX_TYPE_URL.DELEGATE:
      case TX_TYPE_URL.REDELEGATE:
      case TX_TYPE_URL.VOTE:
        return TRANSFER_DIRECTION.OUTGOING;
      case TX_TYPE_URL.UNDELEGATE:
      case TX_TYPE_URL.WITHDRAW_REWARD:
      default:
        return TRANSFER_DIRECTION.INCOMING;
    }
  }

  async getConfirmationStatus(
    txs: MultisigTransactionHistoryResponseDto[],
    threshold: number,
  ) {
    const result = await Promise.all(
      txs.map(async (tx) => {
        const confirmations: any[] =
          await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
            tx.MultisigTxId,
            tx.TxHash,
          );
        tx.Confirmations = confirmations
          .filter((x) => x.status === MULTISIG_CONFIRM_STATUS.CONFIRM)
          .map((item) => item.ownerAddress);
        tx.Rejections = confirmations
          .filter((x) => x.status === MULTISIG_CONFIRM_STATUS.REJECT)
          .map((item) => item.ownerAddress);

        tx.ConfirmationsRequired = threshold;
        return tx;
      }),
    );
    return result;
  }

  async getListMultisigConfirmById(
    param: GetMultisigSignaturesParamDto,
    status?: string,
  ): Promise<ResponseDto> {
    const { id } = param;
    try {
      const multisig = await this.multisigTransactionRepos.getMultisigTx(id);
      if (!multisig) throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);

      const result =
        await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
          id,
          undefined,
          status,
        );
      return ResponseDto.response(ErrorMap.SUCCESSFUL, result);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  /**
   * changeSequence
   * @param request
   * @returns
   */
  async changeSequence(
    request: ChangeSequenceTransactionRequestDto,
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
    const requestDeleteTx: DeleteTxRequestDto = {
      id: oldTxId,
    };
    const deleted = await this.deleteTransaction(requestDeleteTx);
    if (deleted.ErrorCode !== ErrorMap.SUCCESSFUL.Code) {
      return deleted;
    }

    // create new tx
    const requestCreateTx: CreateTransactionRequestDto = {
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

  /**
   * deleteTransaction
   * @param request
   * @returns
   */
  async deleteTransaction(request: DeleteTxRequestDto): Promise<ResponseDto> {
    try {
      const { id } = request;
      const authInfo = this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;

      // check tx status
      const tx = await this.multisigTransactionRepos.getTransactionById(id);
      if (tx.status !== TRANSACTION_STATUS.AWAITING_CONFIRMATIONS)
        throw new CustomError(ErrorMap.CANNOT_DELETE_TX);

      await this.deleteTx(tx, creatorAddress);

      // Update next seq
      await this.updateNextSeqAfterDeleteTx(tx.safeId, tx.internalChainId);

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

  async simulate(request: SimulateTxRequestDto): Promise<ResponseDto> {
    try {
      const { encodedMsgs, safeId } = request;
      const messages = JSON.parse(
        Buffer.from(encodedMsgs, 'base64').toString('binary'),
      );

      // get safe info
      const safeInfo = await this.safeRepos.getSafeById(safeId);
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
    request: GetSimulateAddressQueryDto,
  ): Promise<ResponseDto> {
    const { internalChainId } = request;
    const chain = await this.chainRepos.findChain(internalChainId);
    const wallet = await this._simulate.simulateWithChain(chain);
    return ResponseDto.response(ErrorMap.SUCCESSFUL, wallet.getAddresses());
  }

  async createMultisigTransaction(
    request: CreateTransactionRequestDto,
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
      const safe = await this.safeRepos.getSafeByAddress(from, internalChainId);

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
    request: ConfirmTransactionRequestDto,
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
      const safe = await this.safeRepos.getSafeByAddress(
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

      // await this.multisigConfirmRepos.validateSafeOwner(
      //   creatorAddress,
      //   pendingTx.fromAddress,
      //   internalChainId,
      // );

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
    request: SendTransactionRequestDto,
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
      const safe = await this.safeRepos.getSafeByAddress(
        multisigTransaction.fromAddress,
        internalChainId,
      );
      await this.safeOwnerRepo.isSafeOwner(creatorAddress, safe.id);

      // Make tx
      const txBroadcast = await this.makeTx(safe, chain, multisigTransaction);

      // Record owner send transaction
      // await this.multisigConfirmRepos.insertIntoMultisigConfirm(
      //   request.transactionId,
      //   creatorAddress,
      //   '',
      //   '',
      //   internalChainId,
      //   MULTISIG_CONFIRM_STATUS.SEND,
      // );
      await this.safeRepos.updateQueuedTag(multisigTransaction.safeId);

      try {
        await client.broadcastTx(txBroadcast, 10);
      } catch (error) {
        console.log('Error', error);
        //Update status and txhash
        //TxHash is encoded transaction when send it to network
        if (typeof error.txId === 'undefined' || error.txId === null) {
          await this.multisigTransactionRepos.updateFailedTx(
            multisigTransaction,
          );

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
    request: RejectTransactionRequestDto,
  ): Promise<ResponseDto> {
    const { transactionId, internalChainId } = request;
    try {
      const authInfo = this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;
      //Check status of multisig transaction when reject transaction
      const transaction =
        await this.multisigTransactionRepos.getTransactionById(transactionId);

      // Get safe
      const safe = await this.safeRepos.getSafeByAddress(
        transaction.fromAddress,
        internalChainId,
      );
      await this.safeOwnerRepo.isSafeOwner(creatorAddress, safe.id);

      //Check user has rejected transaction before
      // await this.multisigConfirmRepos.checkUserHasSigned(
      //   transactionId,
      //   creatorAddress,
      // );

      // await this.multisigConfirmRepos.insertIntoMultisigConfirm(
      //   request.transactionId,
      //   creatorAddress,
      //   '',
      //   '',
      //   request.internalChainId,
      //   MULTISIG_CONFIRM_STATUS.REJECT,
      // );

      // count number of reject
      const rejectConfirms = [];
      // await this.multisigConfirmRepos.getRejects(
      //   request.transactionId,
      // );

      // count number of owner
      const safeOwner = await this.safeOwnerRepo.getOwnersBySafeId(
        transaction.safeId,
      );

      // if number of reject > number of owner / 2 => reject transaction
      if (safeOwner.length - rejectConfirms.length < safe.threshold) {
        await this.multisigTransactionRepos.cancelTx(transaction);
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
    // await this.multisigConfirmRepos.checkUserHasSigned(
    //   transaction.id,
    //   ownerAddress,
    // );

    // insert into multisig confirm table
    // await this.multisigConfirmRepos.insertIntoMultisigConfirm(
    //   transaction.id,
    //   ownerAddress,
    //   signature,
    //   bodyBytes,
    //   internalChainId,
    //   MULTISIG_CONFIRM_STATUS.CONFIRM,
    // );

    // update tx status to waiting execute if all owner has confirmed
    const awaitingExecutionTx =
      await this.multisigTransactionRepos.updateAwaitingExecutionTx(
        transaction.id,
        safe.id,
      );

    if (awaitingExecutionTx) {
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
    const multisigConfirmArr = [];
    // await this.multisigConfirmRepos.getConfirmedByTxId(
    //   multisigTransaction.id,
    // );

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
   * updateNextSeqAfterDeleteTx
   * @param safeId
   * @param internalChainId
   */
  async updateNextSeqAfterDeleteTx(safeId: number, internalChainId: number) {
    // get safe info
    const safe = await this.safeRepos.getSafeById(safeId);

    // get chain info
    const chain = await this.chainRepos.findChain(internalChainId);

    // get safe account info
    const accountInfo: AccountInfo = await this.getAccountInfoWithNewSeq(
      null,
      safe,
      chain.chainId,
    );

    safe.nextQueueSeq = (
      await this.calculateNextSeq(safe.id, accountInfo.sequence)
    ).toString();

    await this.safeRepos.updateSafe(safe);
  }

  async getTransactionDetails(
    query: GetTxDetailQueryDto,
  ): Promise<ResponseDto> {
    const { multisigTxId, auraTxId, safeAddress } = query;
    try {
      // get multisig tx from db
      const txDetail = await this.getTxFromDB(multisigTxId, auraTxId);

      if (!txDetail.MultisigTxId) {
        // case: receive token from other wallet
        const messages = await this.messageRepos.getMsgsByAuraTxId(
          txDetail.AuraTxId,
        );
        txDetail.Messages = plainToInstance(
          TxMessageResponseDto,
          messages.map((msg) => this.utils.omitByNil(msg)),
        );

        txDetail.Status = this.parseStatus(txDetail.Status);
      } else {
        // get confirmations
        const confirmations =
          await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
            txDetail.MultisigTxId,
            null,
            MULTISIG_CONFIRM_STATUS.CONFIRM,
          );

        // get rejections
        const rejections =
          await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
            txDetail.MultisigTxId,
            null,
            MULTISIG_CONFIRM_STATUS.REJECT,
          );

        // get execution info
        const executors =
          await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
            txDetail.MultisigTxId,
            null,
            MULTISIG_CONFIRM_STATUS.SEND,
          );

        // get messages & auto claim amount
        const multisigMsgs = await this.messageRepos.getMsgsByTxId(
          txDetail.MultisigTxId,
        );
        const autoClaimMsgs = await this.messageRepos.getMsgsByAuraTxId(
          txDetail.AuraTxId,
        );

        // set data
        txDetail.Messages = this.buildMessages(multisigMsgs, autoClaimMsgs);

        txDetail.Confirmations = confirmations;
        txDetail.Rejectors = rejections;
        txDetail.Executor = executors[0];

        txDetail.AutoClaimAmount = this.calculateAutoClaimAmount(autoClaimMsgs);
      }

      // get signed info
      const threshold = await this.safeRepos.getThreshold(safeAddress);
      txDetail.ConfirmationsRequired = threshold.ConfirmationsRequired;

      return ResponseDto.response(ErrorMap.SUCCESSFUL, txDetail);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  buildMessages(
    multisigMsgs: TxMessageResponseDto[],
    autoClaimMsgs: TxMessageResponseDto[],
  ) {
    return multisigMsgs.map((msg) => {
      // get amount from auraTx tbl when msg type is withdraw reward
      if (msg.typeUrl === TX_TYPE_URL.WITHDRAW_REWARD) {
        const withdrawMsg = autoClaimMsgs.filter(
          (x) =>
            x.typeUrl === TX_TYPE_URL.WITHDRAW_REWARD &&
            x.fromAddress === msg.validatorAddress,
        );
        if (withdrawMsg.length > 0) msg.amount = withdrawMsg[0].amount;
      }
      return plainToInstance(TxMessageResponseDto, this.utils.omitByNil(msg));
    });
  }

  calculateAutoClaimAmount(autoClaimMsgs: TxMessageResponseDto[]): number {
    return autoClaimMsgs.reduce((totalAmount, item) => {
      const ignoreTypeUrl = [
        TX_TYPE_URL.SEND.toString(),
        TX_TYPE_URL.MULTI_SEND.toString(),
        TX_TYPE_URL.WITHDRAW_REWARD.toString(),
      ];
      if (ignoreTypeUrl.includes(item.typeUrl)) {
        return totalAmount;
      }
      return Number(totalAmount + item.amount);
    }, 0);
  }

  parseStatus(status: string): string {
    return Number(status) === 0
      ? TRANSACTION_STATUS.SUCCESS
      : TRANSACTION_STATUS.FAILED;
  }

  async getTxFromDB(
    multisigTxId: number,
    auraTxId: number,
  ): Promise<TxDetailDto> {
    const txDetail = multisigTxId
      ? await this.multisigTransactionRepos.getMultisigTxDetail(multisigTxId)
      : await this.auraTxRepo.getAuraTxDetail(auraTxId);
    if (!txDetail) throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);
    return txDetail;
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
