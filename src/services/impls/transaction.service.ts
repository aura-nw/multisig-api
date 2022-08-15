import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  MULTISIG_CONFIRM_STATUS,
  TRANSFER_DIRECTION,
} from 'src/common/constants/app.constant';
import { ErrorMap } from 'src/common/error.map';
import { ResponseDto } from 'src/dtos/responses';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from 'src/module.config';
import { IMultisigConfirmRepository } from 'src/repositories/imultisig-confirm.repository';
import { IMultisigTransactionsRepository } from 'src/repositories/imultisig-transaction.repository';
import { IMultisigWalletOwnerRepository } from 'src/repositories/imultisig-wallet-owner.repository';
import { IMultisigWalletRepository } from 'src/repositories/imultisig-wallet.repository';
import { ITransactionRepository } from 'src/repositories/itransaction.repository';
import { ITransactionService } from '../transaction.service';
import { BaseService } from './base.service';

@Injectable()
export class TransactionService
  extends BaseService
  implements ITransactionService
{
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
    const res = new ResponseDto();

    const multisig = await this.multisigTransactionRepos.findOne(param.id);
    if (!multisig) return res.return(ErrorMap.TRANSACTION_NOT_EXIST);

    const result =
      await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
        param.id,
        undefined,
        status,
      );
    return res.return(ErrorMap.SUCCESSFUL, result);
  }

  async getTransactionHistory(
    request: MODULE_REQUEST.GetAllTransactionsRequest,
  ): Promise<ResponseDto> {
    const { safeAddress, isHistory, pageSize, pageIndex, internalChainId } =
      request;
    const res = new ResponseDto();

    const safe = await this.safeRepos.findByCondition({ safeAddress });
    if (safe.length === 0) return res.return(ErrorMap.NO_SAFES_FOUND);

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
    // Loop to get Status based on Code and get Multisig Confirm of Multisig Tx
    for (const tx of result) {
      if (tx.Direction !== TRANSFER_DIRECTION.OUTGOING) continue;
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
    return res.return(ErrorMap.SUCCESSFUL, result);
  }

  async getTransactionDetails(
    param: MODULE_REQUEST.GetTransactionDetailsParam,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const { internalTxHash, safeAddress } = param;

      // Check if param entered is Id or TxHash
      const condition = this.calculateCondition(internalTxHash);

      // Get transaction by Id or TxHash from Multisig Transaction
      let txDetail =
        await this.multisigTransactionRepos.getTransactionDetailsMultisigTransaction(
          condition,
        );

      // If multisigTx is not null, it means that the transaction is a multisig transaction
      if (!txDetail) {
        txDetail = await this.transRepos.getTransactionDetailsAuraTx(
          internalTxHash,
        );
      }

      // If txDetail is null, it means that the transaction is not found
      if (!txDetail) return res.return(ErrorMap.TRANSACTION_NOT_EXIST);

      if (txDetail.Direction === TRANSFER_DIRECTION.OUTGOING) {
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
      }
      return res.return(ErrorMap.SUCCESSFUL, txDetail);
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500, error.message);
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
