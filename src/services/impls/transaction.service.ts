import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  MULTISIG_CONFIRM_STATUS,
  TRANSACTION_STATUS,
  TRANSFER_DIRECTION,
  TX_TYPE_URL,
} from '../../common/constants/app.constant';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import {
  MultisigTransactionHistoryResponse,
  ResponseDto,
} from '../../dtos/responses';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { IMessageRepository } from '../../repositories';
import { IMultisigConfirmRepository } from '../../repositories/imultisig-confirm.repository';
import { IMultisigTransactionsRepository } from '../../repositories/imultisig-transaction.repository';
import { IMultisigWalletRepository } from '../../repositories/imultisig-wallet.repository';
import { ITransactionRepository } from '../../repositories/itransaction.repository';
import { ITransactionService } from '../transaction.service';
import { BaseService } from './base.service';
import { TxDetail } from 'src/dtos/responses/multisig-transaction/tx-detail.response';
import { TxMessageResponse } from 'src/dtos/responses/message/tx-msg.response';
import { CommonUtil } from 'src/utils/common.util';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TransactionService
  extends BaseService
  implements ITransactionService
{
  private readonly _logger = new Logger(TransactionService.name);
  private readonly utils: CommonUtil = new CommonUtil();

  constructor(
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_TRANSACTION_REPOSITORY)
    private multisigTransactionRepos: IMultisigTransactionsRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY)
    private multisigConfirmRepos: IMultisigConfirmRepository,
    @Inject(REPOSITORY_INTERFACE.ITRANSACTION_REPOSITORY)
    private transRepos: ITransactionRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
    private safeRepos: IMultisigWalletRepository,
    @Inject(REPOSITORY_INTERFACE.IMESSAGE_REPOSITORY)
    private messageRepos: IMessageRepository,
  ) {
    super(transRepos);
    this._logger.log(
      '============== Constructor Transaction Service ==============',
    );
  }

  async getListMultisigConfirmById(
    param: MODULE_REQUEST.GetMultisigSignaturesParam,
    status?: string,
  ): Promise<ResponseDto> {
    const { id } = param;
    try {
      const multisig = await this.multisigTransactionRepos.findOne(id);
      if (!multisig) throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);

      const result =
        await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
          id,
          undefined,
          status,
        );
      return ResponseDto.response(ErrorMap.SUCCESSFUL, result);
    } catch (error) {
      return ResponseDto.responseError(TransactionService.name, error);
    }
  }

  async getTransactionHistory(
    request: MODULE_REQUEST.GetAllTransactionsRequest,
  ): Promise<ResponseDto> {
    const { safeAddress, isHistory, pageSize, pageIndex, internalChainId } =
      request;

    try {
      const safe = await this.safeRepos.findByCondition({ safeAddress });
      if (safe.length === 0) throw new CustomError(ErrorMap.NO_SAFES_FOUND);

      let result: MultisigTransactionHistoryResponse[];
      if (isHistory)
        result = await this.transRepos.getAuraTx(
          safeAddress,
          internalChainId,
          pageIndex,
          pageSize,
        );
      else {
        result = await this.multisigTransactionRepos.getQueueTransaction(
          safeAddress,
          internalChainId,
          pageIndex,
          pageSize,
        );
        result = await this.getConfirmationStatus(result, safe[0].threshold);
      }
      const response = result.map((item) => {
        if (item.TypeUrl === null) item.TypeUrl = TX_TYPE_URL.RECEIVE;

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
      return ResponseDto.responseError(TransactionService.name, error);
    }
  }

  async getConfirmationStatus(
    txs: MultisigTransactionHistoryResponse[],
    threshold: number,
  ) {
    const result = await Promise.all(
      txs.map(async (tx) => {
        const confirmations: any[] =
          await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
            tx.MultisigTxId,
            tx.TxHash,
          );
        tx.Confirmations = confirmations.filter(
          (x) => x.status === MULTISIG_CONFIRM_STATUS.CONFIRM,
        ).length;
        tx.Rejections = confirmations.length - tx.Confirmations;

        tx.ConfirmationsRequired = threshold;
        return tx;
      }),
    );
    return result;
  }

  async getTransactionDetails(
    query: MODULE_REQUEST.GetTxDetailQuery,
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
          TxMessageResponse,
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
      return ResponseDto.responseError(TransactionService.name, error);
    }
  }

  getDirection(typeUrl: string, from: string, safeAddress: string): string {
    switch (typeUrl) {
      case TX_TYPE_URL.SEND:
        return from === safeAddress
          ? TRANSFER_DIRECTION.OUTGOING
          : TRANSFER_DIRECTION.INCOMING;
      case TX_TYPE_URL.MULTI_SEND:
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

  async getTxFromDB(multisigTxId: number, auraTxId: number): Promise<TxDetail> {
    const txDetail = multisigTxId
      ? await this.multisigTransactionRepos.getMultisigTxDetail(multisigTxId)
      : await this.transRepos.getAuraTxDetail(auraTxId);
    if (!txDetail) throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);
    return txDetail;
  }

  buildMessages(
    multisigMsgs: TxMessageResponse[],
    autoClaimMsgs: TxMessageResponse[],
  ) {
    return multisigMsgs.map((msg) => {
      // Remove a null or undefined value
      msg = plainToInstance(TxMessageResponse, this.utils.omitByNil(msg));

      // get amount from auraTx tbl when msg type is withdraw reward
      if (msg.typeUrl === TX_TYPE_URL.WITHDRAW_REWARD) {
        const withdrawMsg = autoClaimMsgs.filter(
          (x) =>
            x.typeUrl === TX_TYPE_URL.WITHDRAW_REWARD &&
            x.fromAddress === msg.validatorAddress,
        );
        if (withdrawMsg.length > 0) msg.amount = withdrawMsg[0].amount;
      }
      return msg;
    });
  }

  calculateAutoClaimAmount(autoClaimMsgs: TxMessageResponse[]): number {
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
}
