import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { In, ObjectLiteral, Repository } from 'typeorm';
import { ENTITIES_CONFIG, REPOSITORY_INTERFACE } from '../../module.config';
import { IMultisigTransactionsRepository } from '../imultisig-transaction.repository';
import { AuraTx, Chain, MultisigTransaction } from '../../entities';
import {
  MULTISIG_CONFIRM_STATUS,
  TRANSACTION_STATUS,
  TRANSFER_DIRECTION,
} from '../../common/constants/app.constant';
import { IMultisigConfirmRepository } from '../imultisig-confirm.repository';
import { IMultisigWalletRepository } from '../imultisig-wallet.repository';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import { plainToInstance } from 'class-transformer';
import { MultisigTransactionHistoryResponse } from '../../dtos/responses';
import {
  TxDetail,
  TxDetailResponse,
} from '../../dtos/responses/multisig-transaction/tx-detail.response';

@Injectable()
export class MultisigTransactionRepository
  extends BaseRepository
  implements IMultisigTransactionsRepository
{
  private readonly _logger = new Logger(MultisigTransactionRepository.name);
  constructor(
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY)
    private multisigConfirmRepos: IMultisigConfirmRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
    private safeRepos: IMultisigWalletRepository,
    @InjectRepository(ENTITIES_CONFIG.MULTISIG_TRANSACTION)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Multisig Transaction Repository ==============',
    );
  }

  async deleteTx(id: number): Promise<void> {
    await this.repos
      .createQueryBuilder()
      .update(MultisigTransaction)
      .set({
        status: TRANSACTION_STATUS.DELETED,
      })
      .where('Id = :id', { id })
      .execute();
  }

  async updateQueueTxToReplaced(safeId: number, sequence: number) {
    await this.repos
      .createQueryBuilder()
      .update(MultisigTransaction)
      .set({
        status: TRANSACTION_STATUS.REPLACED,
      })
      .where(
        'SafeId = :safeId and Sequence = :sequence and Status IN (:...status)',
        {
          safeId,
          sequence,
          status: [
            TRANSACTION_STATUS.AWAITING_CONFIRMATIONS,
            TRANSACTION_STATUS.AWAITING_EXECUTION,
          ],
        },
      )
      .execute();
  }

  /**
   * Find, remove duplicate and sort sequence of queue tx.
   * @param safeId
   * @returns
   */
  async findSequenceInQueue(safeId: number): Promise<number[]> {
    const result = await this.repos.find({
      where: {
        safeId: safeId,
        status: In([
          TRANSACTION_STATUS.AWAITING_CONFIRMATIONS,
          TRANSACTION_STATUS.AWAITING_EXECUTION,
        ]),
      },
      select: ['sequence'],
    });
    const sequence = result.map((item) => Number(item['sequence']));
    return [...new Set(sequence)].sort();
  }

  async updateTxBroadcastSuccess(
    transactionId: number,
    txHash: string,
  ): Promise<any> {
    const multisigTransaction = await this.findOne({
      where: {
        id: transactionId,
      },
    });

    multisigTransaction.status = TRANSACTION_STATUS.PENDING;
    multisigTransaction.txHash = txHash;
    await this.update(multisigTransaction);
  }

  async getBroadcastableTx(
    transactionId: number,
  ): Promise<MultisigTransaction> {
    const multisigTransaction = await this.findOne({
      where: { id: transactionId },
    });

    if (
      !multisigTransaction ||
      multisigTransaction.status != TRANSACTION_STATUS.AWAITING_EXECUTION
    ) {
      throw new CustomError(ErrorMap.TRANSACTION_NOT_VALID);
    }

    return multisigTransaction;
  }

  async getTransactionById(
    transactionId: number,
  ): Promise<MultisigTransaction> {
    const transaction = await this.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);
    }

    return transaction;
  }

  async insertMultisigTransaction(
    transaction: MultisigTransaction,
  ): Promise<any> {
    return this.create(transaction);
  }

  async updateTxStatusIfSatisfied(
    transactionId: number,
    safeId: number,
    internalChainId: number,
  ) {
    // get list confirm
    const listConfirmAfterSign =
      await this.multisigConfirmRepos.findByCondition({
        multisigTransactionId: transactionId,
        status: MULTISIG_CONFIRM_STATUS.CONFIRM,
        internalChainId: internalChainId,
      });

    const safe = await this.safeRepos.getSafe(String(safeId));

    // check if list confirm >= threshold
    // update status of multisig transaction
    if (listConfirmAfterSign.length >= safe.threshold) {
      const transaction = await this.findOne({
        where: { id: transactionId },
      });
      transaction.status = TRANSACTION_STATUS.AWAITING_EXECUTION;

      await this.update(transaction);
    }
  }

  async getMultisigTxId(internalTxHash: string) {
    const sqlQuerry = this.repos
      .createQueryBuilder('multisigTransaction')
      .where('multisigTransaction.txHash = :internalTxHash', { internalTxHash })
      .select(['multisigTransaction.id as id']);
    return sqlQuerry.getRawOne();
  }

  async getMultisigTxDetail(multisigTxId: number): Promise<TxDetail> {
    const tx = await this.repos
      .createQueryBuilder('MT')
      .leftJoin(AuraTx, 'AT', 'MT.TxHash = AT.TxHash')
      .where('MT.Id = :multisigTxId', { multisigTxId })
      .select([
        'AT.Id as AuraTxId',
        'MT.Id as MultisigTxId',
        'AT.TxHash as TxHash',
        'MT.Fee as Fee',
        'MT.Gas as Gas',
        'MT.Status as Status',
        'MT.Sequence as Sequence',
        'MT.CreatedAt as CreatedAt',
        'MT.UpdatedAt as UpdatedAt',
      ])
      .getRawOne();

    return plainToInstance(TxDetail, tx);
  }

  async getTransactionDetailsMultisigTransaction(
    condition: any,
  ): Promise<TxDetailResponse> {
    const param = condition.txHash ? condition.txHash : condition.id;
    const sqlQuerry = this.repos
      .createQueryBuilder('multisigTransaction')
      .innerJoin(
        Chain,
        'chain',
        'multisigTransaction.internalChainId = chain.id',
      )
      .select([
        'multisigTransaction.id as Id',
        'multisigTransaction.createdAt as CreatedAt',
        'multisigTransaction.updatedAt as UpdatedAt',
        'multisigTransaction.fromAddress as FromAddress',
        'multisigTransaction.toAddress as ToAddress',
        'multisigTransaction.txHash as TxHash',
        'multisigTransaction.amount as Amount',
        'multisigTransaction.denom as Denom',
        'multisigTransaction.status as Status',
        'multisigTransaction.gas as GasWanted',
        'multisigTransaction.fee as GasPrice',
        'chain.chainId as ChainId',
      ]);
    if (condition.txHash)
      sqlQuerry.where('multisigTransaction.txHash = :param', { param });
    else sqlQuerry.where('multisigTransaction.id = :param', { param });
    const result = await sqlQuerry.getRawOne();

    if (result) {
      const txDetail = plainToInstance(TxDetailResponse, result);
      txDetail.Direction = TRANSFER_DIRECTION.OUTGOING;

      return txDetail;
    }
    return result;
  }

  async getQueueTransaction(
    safeAddress: string,
    internalChainId: number,
    pageIndex: number,
    limit: number,
  ): Promise<MultisigTransactionHistoryResponse[]> {
    const offset = limit * (pageIndex - 1);
    const result: any[] = await this.repos.query(
      `
      SELECT Id as MultisigTxId, NULL as AuraTxId, CreatedAt, UpdatedAt, Amount as MultisigTxAmount, TypeUrl, FromAddress as FromAddress, Status, Sequence
      FROM MultisigTransaction
      WHERE FromAddress = ?
      AND (Status = ? OR Status = ? OR Status = ?)
      AND InternalChainId = ?
      ORDER BY UpdatedAt DESC
      LIMIT ? OFFSET ?
    `,
      [
        safeAddress,
        TRANSACTION_STATUS.AWAITING_CONFIRMATIONS,
        TRANSACTION_STATUS.AWAITING_EXECUTION,
        TRANSACTION_STATUS.PENDING,
        internalChainId,
        limit,
        offset,
      ],
    );
    const txs = plainToInstance(MultisigTransactionHistoryResponse, result);
    return txs;
  }
}
