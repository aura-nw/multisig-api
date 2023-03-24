import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  MultisigConfirmStatus,
  TransactionStatus,
} from '../../common/constants/app.constant';
import { CustomError } from '../../common/custom-error';
import { ErrorMap } from '../../common/error.map';
import { SafeRepository } from '../safe/safe.repository';
import { MultisigTransaction } from './entities/multisig-transaction.entity';
import { AuraTx } from '../aura-tx/entities/aura-tx.entity';
import { TxDetailDto } from './dto/response/tx-detail.res';
import { MultisigTransactionHistoryResponseDto } from './dto';
import { MultisigConfirmRepository } from '../multisig-confirm/multisig-confirm.repository';

@Injectable()
export class MultisigTransactionRepository {
  private readonly logger = new Logger(MultisigTransactionRepository.name);

  constructor(
    private safeRepos: SafeRepository,
    private multisigConfirmRepos: MultisigConfirmRepository,
    @InjectRepository(MultisigTransaction)
    private readonly repo: Repository<MultisigTransaction>,
  ) {
    this.logger.log(
      '============== Constructor Multisig Transaction Repository ==============',
    );
  }

  async getMultisigTx(id: number): Promise<MultisigTransaction> {
    const tx = await this.repo.findOne({
      where: {
        id,
      },
    });
    if (!tx) throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);
    return tx;
  }

  /**
   * Set status of transaction to CANCELLED
   * @param tx
   */
  async cancelTx(tx: MultisigTransaction): Promise<void> {
    const updatedTx = tx;
    updatedTx.status = TransactionStatus.CANCELLED;
    await this.repo.save(tx);
  }

  /**
   * Set status of transaction to FAILED
   * @param tx
   */
  async updateFailedTx(tx: MultisigTransaction): Promise<void> {
    const updatedTx = tx;
    updatedTx.status = TransactionStatus.FAILED;
    await this.repo.save(updatedTx);
  }

  /**
   * Set status of transaction to DELETED
   * @param id
   */
  async deleteTx(id: number): Promise<void> {
    const result = await this.repo
      .createQueryBuilder()
      .update(MultisigTransaction)
      .set({
        status: TransactionStatus.DELETED,
      })
      .where('Id = :id', { id })
      .execute();

    if (result.affected === 0) {
      throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);
    } else {
      this.logger.log('Delete transaction successfully');
    }
  }

  /**
   * updateQueueTxToReplaced
   * @param safeId
   * @param sequence
   */
  async updateQueueTxToReplaced(safeId: number, sequence: number) {
    await this.repo
      .createQueryBuilder()
      .update(MultisigTransaction)
      .set({
        status: TransactionStatus.REPLACED,
      })
      .where(
        'SafeId = :safeId and Sequence = :sequence and Status IN (:...status)',
        {
          safeId,
          sequence,
          status: [
            TransactionStatus.AWAITING_CONFIRMATIONS,
            TransactionStatus.AWAITING_EXECUTION,
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
    const result = await this.repo.find({
      where: {
        safeId,
        status: In([
          TransactionStatus.AWAITING_CONFIRMATIONS,
          TransactionStatus.AWAITING_EXECUTION,
        ]),
      },
      select: ['sequence'],
    });
    const sequence = result.map((item) => Number(item.sequence));
    return [...new Set(sequence)].sort();
  }

  /**
   * updateTxBroadcastSuccess
   * @param transactionId
   * @param txHash
   */
  async updateTxBroadcastSuccess(
    transactionId: number,
    txHash: string,
  ): Promise<void> {
    const multisigTransaction = await this.repo.findOne({
      where: {
        id: transactionId,
      },
    });

    multisigTransaction.status = TransactionStatus.PENDING;
    multisigTransaction.txHash = txHash;
    await this.repo.save(multisigTransaction);
  }

  async getBroadcastableTx(
    transactionId: number,
  ): Promise<MultisigTransaction> {
    const multisigTransaction = await this.repo.findOne({
      where: { id: transactionId },
    });

    if (
      !multisigTransaction ||
      multisigTransaction.status !== TransactionStatus.AWAITING_EXECUTION
    ) {
      throw new CustomError(ErrorMap.TRANSACTION_NOT_VALID);
    }

    return multisigTransaction;
  }

  async getTransactionById(
    transactionId: number,
  ): Promise<MultisigTransaction> {
    const transaction = await this.repo.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);
    }

    return transaction;
  }

  async insertMultisigTransaction(
    transaction: MultisigTransaction,
  ): Promise<MultisigTransaction> {
    return this.repo.save(transaction);
  }

  async isExecutable(multisigTxId: number, safeId: number): Promise<boolean> {
    // get list confirm
    const listConfirmAfterSign =
      await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
        multisigTxId,
        undefined,
        MultisigConfirmStatus.CONFIRM,
      );

    const safe = await this.safeRepos.getSafeById(safeId);

    // check if list confirm >= threshold
    // update status of multisig transaction
    if (listConfirmAfterSign.length >= safe.threshold) {
      return true;
    }
    return false;
  }

  async updateAwaitingExecutionTx(
    multisigTxId: number,
    safeId: number,
  ): Promise<MultisigTransaction> {
    const isExecutable = await this.isExecutable(multisigTxId, safeId);
    if (isExecutable) {
      const transaction = await this.repo.findOne({
        where: { id: multisigTxId },
      });
      if (!transaction) throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);
      transaction.status = TransactionStatus.AWAITING_EXECUTION;

      return this.repo.save(transaction);
    }

    return undefined;
  }

  async getMultisigTxId(internalTxHash: string) {
    return this.repo.findOne({
      where: {
        txHash: internalTxHash,
      },
      select: ['id'],
    });
  }

  async getMultisigTxDetail(multisigTxId: number): Promise<TxDetailDto> {
    const tx = await this.repo
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
        'AT.Timestamp as Timestamp',
      ])
      .getRawOne<TxDetailDto>();

    return tx;
  }

  async getQueueTransaction(
    safeAddress: string,
    internalChainId: number,
    pageIndex: number,
    limit: number,
  ): Promise<MultisigTransactionHistoryResponseDto[]> {
    const offset = limit * (pageIndex - 1);
    const txs = await this.repo
      .createQueryBuilder('MT')
      .where({
        fromAddress: safeAddress,
        status: In([
          TransactionStatus.AWAITING_CONFIRMATIONS,
          TransactionStatus.AWAITING_EXECUTION,
          TransactionStatus.PENDING,
        ]),
        internalChainId,
      })
      .orderBy('MT.UpdatedAt', 'DESC')
      .skip(offset)
      .take(limit)
      .select([
        'id as MultisigTxId',
        'null as AuraTxId',
        'createdAt as CreatedAt',
        'updatedAt as UpdatedAt',
        'amount as MultisigTxAmount',
        'typeUrl as TypeUrl',
        'fromAddress as FromAddress',
        'status as Status',
        'sequence as Sequence',
      ])
      .getRawMany<MultisigTransactionHistoryResponseDto>();
    return txs;
  }
}
