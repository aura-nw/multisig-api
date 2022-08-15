import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  MULTISIG_CONFIRM_STATUS,
  TRANSACTION_STATUS,
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
      const safeAddress = { safeAddress: param.safeAddress };

      const safe = await this.safeRepos.findByCondition(safeAddress);
      if (!safe) return res.return(ErrorMap.NO_SAFES_FOUND);

      const internalTxHash = param.internalTxHash;

      // Check if param entered is Id or TxHash
      const condition = this.calculateCondition(internalTxHash);
      let result;
      let rawResult = await this.transRepos.getTransactionDetailsAuraTx(
        condition,
      );
      // Query based on condition
      if (!rawResult || rawResult.Code !== '0') {
        rawResult =
          await this.multisigTransactionRepos.getTransactionDetailsMultisigTransaction(
            condition,
          );
      }
      if (!rawResult) return res.return(ErrorMap.TRANSACTION_NOT_EXIST);

      // Check if From and ToAddress is null
      if (rawResult.FromAddress === '') {
        const tx =
          await this.multisigTransactionRepos.getTransactionDetailsMultisigTransaction(
            condition,
          );
        if (tx.FromAddress !== '') {
          rawResult.FromAddress = tx.FromAddress;
          rawResult.ToAddress = tx.ToAddress;
        }
      }

      // Create data form to return to client
      if (rawResult.Code) {
        result = {
          Id: rawResult.Id,
          CreatedAt: rawResult.CreatedAt,
          UpdatedAt: rawResult.UpdatedAt,
          FromAddress: rawResult.FromAddress,
          ToAddress: rawResult.ToAddress,
          TxHash: rawResult.TxHash,
          Amount: rawResult.Amount,
          Denom: rawResult.Denom,
          GasUsed: rawResult.GasUsed,
          GasWanted: rawResult.GasWanted,
          GasPrice: rawResult.GasPrice,
          ChainId: rawResult.ChainId,
        };
        // Get Status based on Code
        if (rawResult.Code == 0) {
          result.Status = TRANSACTION_STATUS.SUCCESS;
        } else result.Status = TRANSACTION_STATUS.FAILED;
      } else {
        result = {
          Id: rawResult.Id,
          CreatedAt: rawResult.CreatedAt,
          UpdatedAt: rawResult.UpdatedAt,
          FromAddress: rawResult.FromAddress,
          ToAddress: rawResult.ToAddress,
          TxHash: rawResult.TxHash,
          Amount: rawResult.Amount,
          Denom: rawResult.Denom,
          GasUsed: '',
          GasWanted: rawResult.GasWanted,
          GasPrice: rawResult.GasPrice,
          ChainId: rawResult.ChainId,
          Status: rawResult.Status,
          ConfirmationsRequired: rawResult.ConfirmationsRequired,
        };
      }
      // Check is multisig transaction
      if (result.FromAddress == param.safeAddress) {
        const threshold = await this.safeRepos.getThreshold(param.safeAddress);
        const owner = await this.safeOwnerRepos.getOwners(param.safeAddress);
        // Check if data return contain threshold
        if (!result.ConfirmationsRequired) {
          if (threshold) {
            result.ConfirmationsRequired = threshold.ConfirmationsRequired;
          } else {
            result.ConfirmationsRequired = '';
            result.Signers = [];
          }
        }
        result.Signers = owner;
        result.Direction = TRANSFER_DIRECTION.OUTGOING;
        // Check if data return contains TxHash to query with it
        if (result.TxHash) {
          result.Confirmations =
            await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
              undefined,
              result.TxHash,
              MULTISIG_CONFIRM_STATUS.CONFIRM,
            );
          result.Rejectors =
            await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
              undefined,
              result.TxHash,
              MULTISIG_CONFIRM_STATUS.REJECT,
            );
          result.Executor =
            await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
              undefined,
              result.TxHash,
              MULTISIG_CONFIRM_STATUS.SEND,
            );
        } else {
          result.Confirmations =
            await await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
              result.Id,
              undefined,
              MULTISIG_CONFIRM_STATUS.CONFIRM,
            );
          result.Rejectors =
            await await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
              result.Id,
              undefined,
              MULTISIG_CONFIRM_STATUS.REJECT,
            );
          result.Executor =
            await await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
              result.Id,
              undefined,
              MULTISIG_CONFIRM_STATUS.SEND,
            );
        }
      } else if (result.ToAddress == param.safeAddress)
        result.Direction = TRANSFER_DIRECTION.INCOMING;
      return res.return(ErrorMap.SUCCESSFUL, result);
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
