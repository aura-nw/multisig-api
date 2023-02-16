import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  MULTISIG_CONFIRM_STATUS,
  TRANSACTION_STATUS,
  TRANSFER_DIRECTION,
} from '../../common/constants/app.constant';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import { plainToInstance } from 'class-transformer';
import { SafeRepository } from '../safe/safe.repository';
import { MultisigTransaction } from './entities/multisig-transaction.entity';
import { AuraTx } from '../aura-tx/entities/aura-tx.entity';
import { Chain } from '../chain/entities/chain.entity';
import { TxDetailDto, TxDetailResponse } from './dto/response/tx-detail.res';
import { MultisigTransactionHistoryResponseDto } from './dto';

@Injectable()
export class MultisigTransactionRepository {
  private readonly _logger = new Logger(MultisigTransactionRepository.name);
  constructor(
    // private multisigConfirmRepos: MultisigConfirmRepository,
    private safeRepos: SafeRepository,
    @InjectRepository(MultisigTransaction)
    private readonly repo: Repository<MultisigTransaction>,
  ) {
    this._logger.log(
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
    tx.status = TRANSACTION_STATUS.CANCELLED;
    await this.repo.save(tx);
  }

  /**
   * Set status of transaction to FAILED
   * @param tx
   */
  async updateFailedTx(tx: MultisigTransaction): Promise<void> {
    tx.status = TRANSACTION_STATUS.FAILED;
    await this.repo.save(tx);
  }

  /**
   * Set status of transaction to DELETED
   * @param id
   */
  async deleteTx(id: number): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(MultisigTransaction)
      .set({
        status: TRANSACTION_STATUS.DELETED,
      })
      .where('Id = :id', { id })
      .execute();
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
    const result = await this.repo.find({
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

  /**
   * updateTxBroadcastSuccess
   * @param transactionId
   * @param txHash
   */
  async updateTxBroadcastSuccess(
    transactionId: number,
    txHash: string,
  ): Promise<any> {
    const multisigTransaction = await this.repo.findOne({
      where: {
        id: transactionId,
      },
    });

    multisigTransaction.status = TRANSACTION_STATUS.PENDING;
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
      multisigTransaction.status != TRANSACTION_STATUS.AWAITING_EXECUTION
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
  ): Promise<any> {
    return this.repo.save(transaction);
  }

  async isExecutable(multisigTxId: number, safeId: number): Promise<boolean> {
    // get list confirm
    const listConfirmAfterSign = [];
    // await this.multisigConfirmRepos.getListConfirmMultisigTransaction(
    //   multisigTxId,
    //   undefined,
    //   MULTISIG_CONFIRM_STATUS.CONFIRM,
    // );

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
    if (!isExecutable) return;

    const transaction = await this.repo.findOne({
      where: { id: multisigTxId },
    });
    transaction.status = TRANSACTION_STATUS.AWAITING_EXECUTION;

    const updatedTx = await this.repo.save(transaction);
    return updatedTx;
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
      ])
      .getRawOne();

    return plainToInstance(TxDetailDto, tx);
  }

  async getTransactionDetailsMultisigTransaction(
    condition: any,
  ): Promise<TxDetailResponse> {
    const param = condition.txHash ? condition.txHash : condition.id;
    const sqlQuerry = this.repo
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
  ): Promise<MultisigTransactionHistoryResponseDto[]> {
    const offset = limit * (pageIndex - 1);
    const result: any[] = await this.repo.query(
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
    const txs = plainToInstance(MultisigTransactionHistoryResponseDto, result);
    return txs;
  }
}
