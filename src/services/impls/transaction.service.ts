import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  MULTISIG_CONFIRM_STATUS,
  TRANSFER_DIRECTION,
} from '../../common/constants/app.constant';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import { ResponseDto } from '../../dtos/responses';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { IMessageRepository } from '../../repositories';
import { IMultisigConfirmRepository } from '../../repositories/imultisig-confirm.repository';
import { IMultisigTransactionsRepository } from '../../repositories/imultisig-transaction.repository';
import { IMultisigWalletOwnerRepository } from '../../repositories/imultisig-wallet-owner.repository';
import { IMultisigWalletRepository } from '../../repositories/imultisig-wallet.repository';
import { ITransactionRepository } from '../../repositories/itransaction.repository';
import { ITxMessageRepository } from '../../repositories/itx-message.repository';
import { ITransactionService } from '../transaction.service';
import { BaseService } from './base.service';

@Injectable()
export class TransactionService
  extends BaseService
  implements ITransactionService {
  private readonly _logger = new Logger(TransactionService.name);

  constructor(
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_TRANSACTION_REPOSITORY)
    private multisigTransactionRepos: IMultisigTransactionsRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY)
    private multisigConfirmRepos: IMultisigConfirmRepository,
    @Inject(REPOSITORY_INTERFACE.ITRANSACTION_REPOSITORY)
    private transRepos: ITransactionRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
    private safeRepos: IMultisigWalletRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_OWNER_REPOSITORY)
    private safeOwnerRepos: IMultisigWalletOwnerRepository,
    @Inject(REPOSITORY_INTERFACE.IMESSAGE_REPOSITORY)
    private messageRepos: IMessageRepository,
    @Inject(REPOSITORY_INTERFACE.ITX_MESSAGE_REPOSITORY)
    private txMessageRepos: ITxMessageRepository,
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

      let result;
      if (isHistory)
        result = await this.transRepos.getAuraTx(
          safeAddress,
          internalChainId,
          pageIndex,
          pageSize,
        );
      else
        result = await this.multisigTransactionRepos.getQueueTransaction(
          safeAddress,
          internalChainId,
          pageIndex,
          pageSize,
        );
      let txIds = result.map(res => res.Id);
      let txMessages = await this.txMessageRepos.getTxMessagesFromTxIds(txIds);
      result.map(res => {
        let tm = txMessages.find(tm => tm.TxId = res.Id);
        res.Amount = tm.Amount;
        res.Denom = tm.Denom;
      });
      // Loop to get Status based on Code and get Multisig Confirm of Multisig Tx
      for (const tx of result) {
        // continue if tx is not multisig
        if (tx.TypeUrl === null) continue;
        if (tx.TypeUrl === '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward') tx.Direction = TRANSFER_DIRECTION.INCOMING;
        const confirmations: any[] =
          await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
            tx.Id,
            tx.TxHash,
          );
        tx.Confirmations = confirmations.filter(
          (x) => x.status === MULTISIG_CONFIRM_STATUS.CONFIRM,
        ).length;
        tx.Rejections = confirmations.length - tx.Confirmations;

        tx.ConfirmationsRequired = safe[0].threshold;
      }
      return ResponseDto.response(ErrorMap.SUCCESSFUL, result);
    } catch (error) {
      return ResponseDto.responseError(TransactionService.name, error);
    }
  }

  async getTransactionDetails(
    param: MODULE_REQUEST.GetTransactionDetailsParam,
    query: MODULE_REQUEST.GetTxDetailQuery,
  ): Promise<ResponseDto> {
    const { direction } = query;
    try {
      const { internalTxHash, safeAddress } = param;

      // Check if param entered is Id or TxHash
      const condition = this.calculateCondition(internalTxHash);
      let txDetail = await this.multisigTransactionRepos.getTransactionDetailsMultisigTransaction(
        condition,
      );
      if (txDetail) {
        const threshold = await this.safeRepos.getThreshold(safeAddress);
        const owner = await this.safeOwnerRepos.getOwners(safeAddress);
        txDetail.ConfirmationsRequired = threshold.ConfirmationsRequired;
        txDetail.Signers = owner;
        // if txHash is null => it means that the transaction is not executed yet, query by Id
        const multisigTxId = txDetail.TxHash ? undefined : txDetail.Id;

        // Get confirmations of multisig transaction
        txDetail.Confirmations =
          await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
            multisigTxId,
            txDetail.TxHash,
            MULTISIG_CONFIRM_STATUS.CONFIRM,
          );

        // Get rejections of multisig transaction
        txDetail.Rejectors =
          await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
            multisigTxId,
            txDetail.TxHash,
            MULTISIG_CONFIRM_STATUS.REJECT,
          );

        // Get execution of multisig transaction
        txDetail.Executor =
          await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
            multisigTxId,
            txDetail.TxHash,
            MULTISIG_CONFIRM_STATUS.SEND,
          );

        // Get msgs of tx
        txDetail.Messages = await this.messageRepos.getMsgsByTxId(txDetail.Id);
      } else {
        // Query deposited tx in aura tx table
        txDetail = await this.transRepos.getTransactionDetailsAuraTx(
          internalTxHash,
        );
        const txMessages = await this.txMessageRepos.getDetailTxMessagesByTxId(txDetail.Id);
        txDetail.TxMessages = txMessages.map(tm => {
          return {
            fromAddress: tm.FromAddress,
            toAddress: tm.ToAddress,
            amount: tm.Amount,
            denom: tm.Denom
          }
        });
      }

      return ResponseDto.response(ErrorMap.SUCCESSFUL, txDetail);
    } catch (error) {
      return ResponseDto.responseError(TransactionService.name, error);
    }
  }

  private calculateCondition(internalTxHash: string) {
    return isNaN(Number(internalTxHash))
      ? {
        txHash: internalTxHash,
      }
      : {
        id: internalTxHash,
      };
  }
}
