import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Injectable, Logger } from '@nestjs/common';
import { isNull } from 'lodash';
import {
  coins,
  isAminoMsgSend,
  makeMultisignedTx,
  StargateClient,
} from '@cosmjs/stargate';
import { fromBase64, fromUtf8 } from '@cosmjs/encoding';
import { MultisigThresholdPubkey } from '@cosmjs/amino';
import { plainToInstance } from 'class-transformer';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import {
  DisplayTypes,
  MultisigConfirmStatus,
  SafeStatus,
  TransactionStatus,
  TransferDirection,
  TxTypeUrl,
} from '../../common/constants/app.constant';

import { SimulateService } from '../simulate';
import { CustomError } from '../../common/custom-error';
import { MultisigTransactionRepository } from './multisig-transaction.repository';
import { MultisigConfirmRepository } from '../multisig-confirm/multisig-confirm.repository';
import { ChainRepository } from '../chain/chain.repository';
import { SafeRepository } from '../safe/safe.repository';
import { SafeOwnerRepository } from '../safe-owner/safe-owner.repository';
import { MessageRepository } from '../message/message.repository';
import { NotificationRepository } from '../notification/notification.repository';
import { AuraTxRepository } from '../aura-tx/aura-tx.repository';
import { TxMessageResponseDto } from '../message/dto/response/tx-message.res';
import {
  ChangeSequenceTransactionRequestDto,
  ConfirmTransactionRequestDto,
  CreateTransactionRequestDto,
  CreateTxResDto,
  DeleteTxRequestDto,
  GetAllTransactionsRequestDto,
  GetMultisigSignaturesParamDto,
  GetSimulateAddressQueryDto,
  GetTxDetailQueryDto,
  MultisigTransactionHistoryResponseDto,
  RejectTransactionRequestDto,
  SendTransactionRequestDto,
  SendTxResDto,
  SimulateTxRequestDto,
  TxDetailDto,
} from './dto';
import { MultisigTransaction } from './entities/multisig-transaction.entity';
import { Chain } from '../chain/entities/chain.entity';
import { Safe } from '../safe/entities/safe.entity';
import { TransactionHistoryRepository } from '../transaction-history/transaction-history.repository';
import { CommonUtil } from '../../utils/common.util';
import { IndexerClient } from '../../shared/services/indexer.service';
import { GetListConfirmResDto } from '../multisig-confirm/dto';
import { IMessageUnknown } from '../../interfaces';
import { EthermintHelper } from '../../chains/ethermint/ethermint.helper';
import { SimulateResponse } from '../simulate/dtos';
import { AccountInfo } from '../../common/dtos';
import { ChainHelper } from '../../chains/chain.helper';
import { ICw20Msg } from './interfaces';

@Injectable()
export class MultisigTransactionService {
  private readonly logger = new Logger(MultisigTransactionService.name);

  private readonly commonUtil: CommonUtil = new CommonUtil();

  private ethermintHelper = new EthermintHelper();

  constructor(
    private indexer: IndexerClient,
    private multisigTransactionRepos: MultisigTransactionRepository,
    private auraTxRepo: AuraTxRepository,
    private multisigConfirmRepos: MultisigConfirmRepository,
    private chainRepos: ChainRepository,
    private safeRepos: SafeRepository,
    private safeOwnerRepo: SafeOwnerRepository,
    private messageRepos: MessageRepository,
    private notificationRepo: NotificationRepository,
    private txHistoryRepo: TransactionHistoryRepository,
    private simulateService: SimulateService,
  ) {
    this.logger.log(
      '============== Constructor Multisig Transaction Service ==============',
    );
  }

  async createMultisigTransaction(
    request: CreateTransactionRequestDto,
  ): Promise<ResponseDto<CreateTxResDto>> {
    const { from, to, authInfoBytes, bodyBytes, signature, internalChainId } =
      request;
    try {
      const authInfo = this.commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;

      // get safe info
      const safe = await this.safeRepos.getSafeByAddress(from, internalChainId);

      // get chain info
      const chain = await this.chainRepos.findChain(internalChainId);

      // get safe account info
      const {
        accountNumber,
        sequence: sequenceInIndexer,
        balances: accountBalance,
      } = await this.indexer.getAccount(chain.chainId, safe.safeAddress);

      // decode data
      const chainHelper = new ChainHelper(chain);
      const {
        decodedAuthInfo,
        decodedMsgs,
        aminoMsgs,
        rawMsgs,
        sequence: decodedSequence,
      } = await chainHelper.decodeAndVerifyTxInfo(
        authInfoBytes,
        bodyBytes,
        signature,
        accountNumber,
        authInfo,
      );

      const transaction = new MultisigTransaction();
      transaction.typeUrl =
        decodedMsgs.length > 1 ? TxTypeUrl.CUSTOM : decodedMsgs[0].typeUrl;
      transaction.fromAddress = from;
      transaction.toAddress = to || '';

      // check balance
      let amount = 0;
      let denom = isAminoMsgSend(aminoMsgs[0])
        ? aminoMsgs[0].value.amount[0].denom
        : chain.denom;

      // check account balance; if balance is not enough, throw error
      if (
        transaction.typeUrl === TxTypeUrl.EXECUTE_CONTRACT &&
        transaction.toAddress !== '' &&
        !(decodedMsgs[0].value instanceof Uint8Array) &&
        decodedMsgs[0].value.msg instanceof Uint8Array
      ) {
        // cw20
        const contractAddress = decodedMsgs[0].value.contract;
        const decodedMsg = fromUtf8(decodedMsgs[0].value.msg);
        const objectMsg = JSON.parse(decodedMsg) as ICw20Msg;
        if (objectMsg.transfer.recipient !== to) {
          throw new CustomError(
            ErrorMap.TRANSACTION_NOT_VALID,
            'recipient address is not match with address in msg',
          );
        }

        const cw20Assets = await this.indexer.getAssetByOwnerAddress(
          safe.safeAddress,
          'CW20',
          chain.chainId,
        );
        const currentCw20Token = cw20Assets.CW20.asset.find(
          (token) => token.contract_address === contractAddress,
        );

        amount = Number(objectMsg.transfer.amount);
        if (currentCw20Token.balance < amount) {
          throw new CustomError(ErrorMap.BALANCE_NOT_ENOUGH);
        }

        denom = currentCw20Token.asset_info.data.symbol;

        transaction.contractAddress = currentCw20Token.contract_address;
      } else {
        // other
        // calculate tx amount
        const txAmount = chainHelper.calculateAmount(aminoMsgs);

        const balance = accountBalance.find((token) => {
          if (denom.search('ibc/') > -1) {
            return token.minimal_denom === denom;
          }
          return token.denom === denom;
        });
        if (Number(balance.amount) < txAmount) {
          throw new CustomError(ErrorMap.BALANCE_NOT_ENOUGH);
        }
        amount = txAmount;
      }

      // is owner of safe
      const safeOwners = await this.safeOwnerRepo.getSafeOwnersWithError(
        safe.id,
      );
      if (!safeOwners.some((owner) => owner.ownerAddress === creatorAddress))
        throw new CustomError(ErrorMap.PERMISSION_DENIED);

      // save tx
      transaction.amount = amount > 0 ? amount : undefined;
      transaction.gas = decodedAuthInfo.fee.gasLimit.toNumber();
      transaction.fee = Number(decodedAuthInfo.fee.amount[0].amount);
      transaction.accountNumber = accountNumber;
      transaction.denom = denom;
      transaction.status = TransactionStatus.AWAITING_CONFIRMATIONS;
      transaction.internalChainId = internalChainId;
      transaction.rawMessages = rawMsgs;
      transaction.sequence = decodedSequence.toString();
      transaction.safeId = safe.id;
      const transactionResult =
        await this.multisigTransactionRepos.insertMultisigTransaction(
          transaction,
        );

      // save msgs
      await this.messageRepos.saveMsgs(transactionResult.id, decodedMsgs);

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
      safe.nextQueueSeq = await this.calculateNextSeq(
        safe.id,
        sequenceInIndexer,
      );
      safe.accountNumber = accountNumber.toString();
      safe.sequence = sequenceInIndexer.toString();
      await this.safeRepos.updateSafe(safe);

      // notify to another owners
      await this.notificationRepo.notifyNewTx(
        safe.id,
        safe.safeAddress,
        transactionResult.id,
        Number(transactionResult.sequence),
        creatorAddress,
        safeOwners
          .filter((safeOwner) => safeOwner.ownerAddress !== creatorAddress)
          .map((safeOwner) => safeOwner.ownerAddress),
        internalChainId,
      );

      // update queued tag
      await this.safeRepos.updateQueuedTag(safe.id);

      return ResponseDto.response(ErrorMap.SUCCESSFUL, {
        transactionId: transactionResult.id,
      });
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async confirmMultisigTransaction(
    request: ConfirmTransactionRequestDto,
  ): Promise<ResponseDto<void>> {
    try {
      const {
        transactionId,
        bodyBytes,
        signature,
        authInfoBytes,
        internalChainId,
      } = request;
      const authInfo = this.commonUtil.getAuthInfo();
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

      const accountNumber = await this.getAccountNumber(safe, chain.chainId);

      // verify data
      const chainHelper = new ChainHelper(chain);
      await chainHelper.decodeAndVerifyTxInfo(
        authInfoBytes,
        bodyBytes,
        signature,
        accountNumber,
        authInfo,
      );

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

      // update queued tag
      await this.safeRepos.updateQueuedTag(safe.id);

      return ResponseDto.response(ErrorMap.SUCCESSFUL);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async sendMultisigTransaction(
    request: SendTransactionRequestDto,
  ): Promise<ResponseDto<SendTxResDto>> {
    try {
      const { internalChainId, transactionId } = request;
      const authInfo = this.commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;

      const chain = await this.chainRepos.findChain(internalChainId);
      const client: StargateClient = await StargateClient.connect(chain.rpc);

      // get tx
      const multisigTransaction =
        await this.multisigTransactionRepos.getBroadcastableTx(transactionId);

      // update tx status
      await this.multisigTransactionRepos.updateTxToExecuting(transactionId);

      // get safe & validate safe owner
      const safe = await this.safeRepos.getSafeByAddress(
        multisigTransaction.fromAddress,
        internalChainId,
      );
      await this.safeOwnerRepo.isSafeOwner(creatorAddress, safe.id);

      // Make tx
      const txBroadcast = await this.makeTx(safe, chain, multisigTransaction);

      // Record owner send transaction
      await this.multisigConfirmRepos.insertIntoMultisigConfirm(
        transactionId,
        creatorAddress,
        '',
        '',
        internalChainId,
        MultisigConfirmStatus.SEND,
      );

      try {
        await client.broadcastTx(txBroadcast, 10);
      } catch (error: unknown) {
        // Update status and txhash
        // TxHash is encoded transaction when send it to network
        const txId = CommonUtil.getStrProp(error, 'txId');
        this.logger.log(`TxHash: ${txId}`);
        if (txId === undefined) {
          await this.multisigTransactionRepos.updateExecutingTx(
            multisigTransaction.id,
            TransactionStatus.FAILED,
          );

          // re calculate next seq
          safe.nextQueueSeq = await this.calculateNextSeq(
            safe.id,
            Number(multisigTransaction.sequence),
          );

          await this.safeRepos.updateSafe(safe);

          throw CustomError.fromUnknown(
            ErrorMap.INSERT_TRANSACTION_FAILED,
            error,
          );
        }
        // update tx status to "pending"
        await this.multisigTransactionRepos.updateExecutingTx(
          multisigTransaction.id,
          TransactionStatus.PENDING,
          txId,
        );

        // update queue tx have same sequence to "replaced"
        await this.multisigTransactionRepos.updateQueueTxToReplaced(
          multisigTransaction.safeId,
          Number(multisigTransaction.sequence),
        );

        // update safe next queue sequence
        safe.sequence = (Number(multisigTransaction.sequence) + 1).toString();
        safe.nextQueueSeq = await this.calculateNextSeq(
          safe.id,
          Number(multisigTransaction.sequence) + 1,
        );

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

        await this.safeRepos.updateQueuedTag(multisigTransaction.safeId);

        return ResponseDto.response(ErrorMap.SUCCESSFUL, {
          TxHash: txId,
        });
      }
      return undefined;
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async rejectMultisigTransaction(
    request: RejectTransactionRequestDto,
  ): Promise<ResponseDto<void>> {
    const { transactionId, internalChainId } = request;
    try {
      const authInfo = this.commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;
      // Check status of multisig transaction when reject transaction
      const transaction =
        await this.multisigTransactionRepos.getTransactionById(transactionId);

      // Get safe
      const safe = await this.safeRepos.getSafeByAddress(
        transaction.fromAddress,
        internalChainId,
      );
      await this.safeOwnerRepo.isSafeOwner(creatorAddress, safe.id);

      // Check user has rejected transaction before
      await this.multisigConfirmRepos.checkUserHasSigned(
        transactionId,
        creatorAddress,
      );

      await this.multisigConfirmRepos.insertIntoMultisigConfirm(
        transactionId,
        creatorAddress,
        '',
        '',
        internalChainId,
        MultisigConfirmStatus.REJECT,
      );

      // count number of reject
      const rejectConfirms = await this.multisigConfirmRepos.getRejects(
        transactionId,
      );

      // count number of owner
      const safeOwner = await this.safeOwnerRepo.getOwnersBySafeId(
        transaction.safeId,
      );

      // if number of reject > number of owner / 2 => reject transaction
      if (safeOwner.length - rejectConfirms.length < safe.threshold) {
        await this.multisigTransactionRepos.cancelTx(transaction);
      }

      // Update next seq
      await this.updateNextSeqAfterDeleteTx(
        transaction.safeId,
        transaction.internalChainId,
      );

      // update queued tag
      await this.safeRepos.updateQueuedTag(transaction.safeId);

      return ResponseDto.response(ErrorMap.SUCCESSFUL);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async getTransactionHistory(
    request: GetAllTransactionsRequestDto,
  ): Promise<ResponseDto<MultisigTransactionHistoryResponseDto[]>> {
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
        result = await this.getConfirmationStatus(txs, safe.threshold);
      }
      const response = result.map((item) => {
        const updatedItem = {
          ...item,
        };
        if (
          isNull(item.TypeUrl) ||
          [
            TxTypeUrl.SEND.toString(),
            TxTypeUrl.EXECUTE_CONTRACT.toString(),
          ].includes(item.TypeUrl)
        ) {
          if (item.ToAddress === safe.safeAddress)
            updatedItem.DisplayType = TxTypeUrl.RECEIVE;

          if (item.FromAddress === safe.safeAddress && item.ToAddress !== '')
            // ignore case: mint cw20 token
            updatedItem.DisplayType = DisplayTypes.SEND;
        }

        updatedItem.Direction = this.getDirection(
          item.TypeUrl,
          item.ToAddress,
          safeAddress,
        );

        updatedItem.FinalAmount =
          item.MultisigTxAmount || item.AuraTxAmount || item.AuraTxRewardAmount;

        if (!Number.isNaN(Number(item.Status))) {
          updatedItem.Status = this.parseStatus(item.Status);
        }
        return this.commonUtil.omitByNil(updatedItem);
      });
      return ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        plainToInstance(MultisigTransactionHistoryResponseDto, response),
      );
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async getConfirmationStatus(
    txs: MultisigTransactionHistoryResponseDto[],
    threshold: number,
  ) {
    const result = await Promise.all(
      txs.map(async (tx) => {
        const updatedTx = tx;
        const confirmations: GetListConfirmResDto[] =
          await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
            tx.MultisigTxId,
            tx.TxHash,
          );
        updatedTx.Confirmations = confirmations
          .filter((x) => x.status === MultisigConfirmStatus.CONFIRM)
          .map((item) => item.ownerAddress);
        updatedTx.Rejections = confirmations
          .filter((x) => x.status === MultisigConfirmStatus.REJECT)
          .map((item) => item.ownerAddress);

        updatedTx.ConfirmationsRequired = threshold;
        return updatedTx;
      }),
    );
    return result;
  }

  async getListMultisigConfirmById(
    param: GetMultisigSignaturesParamDto,
    status?: string,
  ): Promise<ResponseDto<GetListConfirmResDto[]>> {
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
  ): Promise<ResponseDto<CreateTxResDto>> {
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
    await this.deleteTransaction(requestDeleteTx);

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
    return created;
  }

  /**
   * deleteTransaction
   * @param request
   * @returns
   */
  async deleteTransaction(
    request: DeleteTxRequestDto,
  ): Promise<ResponseDto<void>> {
    try {
      const { id } = request;
      const authInfo = this.commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;

      // check tx status
      const tx = await this.multisigTransactionRepos.getTransactionById(id);
      if (tx.status !== TransactionStatus.AWAITING_CONFIRMATIONS)
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

      // update queued tag
      await this.safeRepos.updateQueuedTagByAddress(tx.fromAddress);

      return ResponseDto.response(ErrorMap.SUCCESSFUL);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async simulate(
    request: SimulateTxRequestDto,
  ): Promise<ResponseDto<SimulateResponse>> {
    try {
      const { encodedMsgs, safeId } = request;
      const messages = JSON.parse(
        Buffer.from(encodedMsgs, 'base64').toString('binary'),
      ) as IMessageUnknown[];

      // get safe info
      const safeInfo = await this.safeRepos.getSafeById(safeId);
      if (safeInfo.status !== SafeStatus.CREATED)
        throw new CustomError(ErrorMap.INVALID_SAFE);

      // get chain info
      const chain = await this.chainRepos.findChain(safeInfo.internalChainId);
      await this.simulateService.initialize(chain);

      const result = await this.simulateService.simulate(
        messages,
        safeInfo,
        chain.rest,
      );
      return ResponseDto.response(ErrorMap.SUCCESSFUL, result);
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  async getSimulateAddresses(
    request: GetSimulateAddressQueryDto,
  ): Promise<ResponseDto<string[]>> {
    const { internalChainId } = request;
    const chain = await this.chainRepos.findChain(internalChainId);
    await this.simulateService.initialize(chain);

    const wallet = this.simulateService.getCurrentWallet();
    return ResponseDto.response(ErrorMap.SUCCESSFUL, wallet.getAddresses());
  }

  async getTransactionDetail(
    query: GetTxDetailQueryDto,
  ): Promise<ResponseDto<TxDetailDto>> {
    const { multisigTxId, auraTxId, safeAddress } = query;
    try {
      // get multisig tx from db
      const txDetail = await this.getTxFromDB(multisigTxId, auraTxId);

      if (txDetail.MultisigTxId) {
        const actions =
          await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
            txDetail.MultisigTxId,
          );
        // get confirmations
        const confirmations: GetListConfirmResDto[] = [];
        const rejections: GetListConfirmResDto[] = [];
        for (const action of actions) {
          // eslint-disable-next-line default-case
          switch (action.status) {
            case MultisigConfirmStatus.CONFIRM: {
              confirmations.push(action);
              break;
            }
            case MultisigConfirmStatus.REJECT: {
              rejections.push(action);
              break;
            }
            case MultisigConfirmStatus.SEND: {
              txDetail.Executor = action;
              break;
            }
            case MultisigConfirmStatus.DELETE: {
              txDetail.Deleter = action;
            }
            // No default
          }
        }

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

        txDetail.AutoClaimAmount = this.calculateAutoClaimAmount(autoClaimMsgs);
      } else {
        // case: receive token from other wallet
        txDetail.Messages = await this.messageRepos.getMsgsByAuraTxId(
          txDetail.AuraTxId,
        );

        txDetail.Status = this.parseStatus(txDetail.Status);
      }

      // get signed info
      const threshold = await this.safeRepos.getThreshold(safeAddress);
      txDetail.ConfirmationsRequired = threshold.ConfirmationsRequired;

      return ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        plainToInstance(TxDetailDto, this.commonUtil.omitByNil(txDetail)),
      );
    } catch (error) {
      return ResponseDto.responseError(MultisigTransactionService.name, error);
    }
  }

  getDirection(typeUrl: string, to: string, safeAddress: string): string {
    switch (typeUrl) {
      case TxTypeUrl.SEND:
      case TxTypeUrl.MULTI_SEND: {
        return to === safeAddress
          ? TransferDirection.INCOMING
          : TransferDirection.OUTGOING;
      }
      case TxTypeUrl.DELEGATE:
      case TxTypeUrl.REDELEGATE:
      case TxTypeUrl.VOTE: {
        return TransferDirection.OUTGOING;
      }
      case TxTypeUrl.UNDELEGATE:
      case TxTypeUrl.WITHDRAW_REWARD: {
        return TransferDirection.INCOMING;
      }
      default: {
        return undefined;
      }
    }
  }

  private async confirmTx(
    transaction: MultisigTransaction,
    ownerAddress: string,
    signature: string,
    bodyBytes: string,
    internalChainId: number,
    safe: Safe,
  ) {
    // Check user has rejected transaction before
    await this.multisigConfirmRepos.checkUserHasSigned(
      transaction.id,
      ownerAddress,
    );

    await this.multisigConfirmRepos.insertIntoMultisigConfirm(
      transaction.id,
      ownerAddress,
      signature,
      bodyBytes,
      internalChainId,
      MultisigConfirmStatus.CONFIRM,
    );

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
  }

  async deleteTx(tx: MultisigTransaction, userAddress: string) {
    // check user is owner
    await this.safeOwnerRepo.isSafeOwner(userAddress, tx.safeId);

    // delete tx
    await this.multisigTransactionRepos.deleteTx(tx.id);

    // insert into multisig confirm
    await this.multisigConfirmRepos.insertIntoMultisigConfirm(
      tx.id,
      userAddress,
      '',
      '',
      tx.internalChainId,
      MultisigConfirmStatus.DELETE,
    );
  }

  async makeTx(
    safeInfo: Safe,
    chainInfo: Chain,
    multisigTransaction: MultisigTransaction,
  ): Promise<Uint8Array> {
    // Get all signature of transaction
    const multisigConfirmArr =
      await this.multisigConfirmRepos.getConfirmedByTxId(
        multisigTransaction.id,
      );

    const addressSignatureMap = new Map<string, Uint8Array>();

    multisigConfirmArr.forEach((x) => {
      const encodeSignature = fromBase64(x.signature);
      addressSignatureMap.set(x.ownerAddress, encodeSignature);
    });

    // Fee
    const sendFee = {
      amount: coins(multisigTransaction.fee.toString(), chainInfo.denom),
      gas: multisigTransaction.gas.toString(),
    };

    const encodedBodyBytes = fromBase64(multisigConfirmArr[0].bodyBytes);

    // Pubkey
    const safePubkey = JSON.parse(
      safeInfo.safePubkey,
    ) as MultisigThresholdPubkey;

    const executeTransaction =
      chainInfo.coinDecimals === 18
        ? this.ethermintHelper.makeMultisignedTxEthermint(
            safePubkey,
            Number(multisigTransaction.sequence),
            sendFee,
            encodedBodyBytes,
            addressSignatureMap,
          )
        : makeMultisignedTx(
            safePubkey,
            Number(multisigTransaction.sequence),
            sendFee,
            encodedBodyBytes,
            addressSignatureMap,
          );

    const encodeTransaction = Uint8Array.from(
      TxRaw.encode(executeTransaction).finish(),
    );
    return encodeTransaction;
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
    const accountInfo: AccountInfo = await this.indexer.getAccount(
      chain.chainId,
      safe.safeAddress,
    );

    safe.nextQueueSeq = await this.calculateNextSeq(
      safe.id,
      accountInfo.sequence,
    );
    safe.sequence = accountInfo.sequence.toString();

    await this.safeRepos.updateSafe(safe);
  }

  buildMessages(
    multisigMsgs: TxMessageResponseDto[],
    autoClaimMsgs: TxMessageResponseDto[],
  ): TxMessageResponseDto[] {
    return multisigMsgs.map((msg) => {
      const adjustMsg = msg;
      // get amount from auraTx tbl when msg type is withdraw reward
      if (msg.typeUrl === TxTypeUrl.WITHDRAW_REWARD) {
        const withdrawMsg = autoClaimMsgs.filter(
          (x) =>
            x.typeUrl === TxTypeUrl.WITHDRAW_REWARD &&
            x.fromAddress === msg.validatorAddress,
        );
        if (withdrawMsg.length > 0) adjustMsg.amount = withdrawMsg[0].amount;
      }
      return adjustMsg;
    });
  }

  calculateAutoClaimAmount(autoClaimMsgs: TxMessageResponseDto[]): number {
    let result = 0;
    for (const item of autoClaimMsgs) {
      const ignoreTypeUrl = [
        TxTypeUrl.SEND.toString(),
        TxTypeUrl.MULTI_SEND.toString(),
        TxTypeUrl.WITHDRAW_REWARD.toString(),
      ];

      if (!ignoreTypeUrl.includes(item.typeUrl)) {
        result += Number(item.amount);
      }
    }
    return result;
  }

  parseStatus(status: string): string {
    return Number(status) === 0
      ? TransactionStatus.SUCCESS
      : TransactionStatus.FAILED;
  }

  async getTxFromDB(
    multisigTxId: number,
    auraTxId: number,
  ): Promise<TxDetailDto> {
    const txDetail = multisigTxId
      ? await this.multisigTransactionRepos.getMultisigTxDetail(multisigTxId)
      : await this.auraTxRepo.getAuraTxDetail(auraTxId);
    return txDetail;
  }

  async calculateNextSeq(
    safeId: number,
    currentSequence: number,
  ): Promise<string> {
    const queueSequences =
      await this.multisigTransactionRepos.findSequenceInQueue(safeId);

    let nextSeq = currentSequence;
    for (const seq of queueSequences) {
      if (seq !== nextSeq) {
        break;
      }
      nextSeq += 1;
    }
    return nextSeq.toString();
  }

  async getAccountNumber(safe: Safe, chainId: string): Promise<number> {
    let accountNumber = Number(safe.accountNumber);

    if (Number.isNaN(accountNumber)) {
      const accountInfo = await this.indexer.getAccount(
        chainId,
        safe.safeAddress,
      );
      accountNumber = accountInfo.accountNumber;
    }
    return accountNumber;
  }
}
