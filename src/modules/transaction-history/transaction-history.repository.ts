import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { TransactionStatus } from '../../common/constants/app.constant';
import { MultisigTransactionHistoryResponseDto } from '../multisig-transaction/dto';
import { TransactionHistory } from './entities/transaction-history.entity';

@Injectable()
export class TransactionHistoryRepository {
  private readonly logger = new Logger(TransactionHistoryRepository.name);

  constructor(
    @InjectRepository(TransactionHistory)
    private readonly repos: Repository<TransactionHistory>,
  ) {
    this.logger.log(
      '============== Constructor Transaction History Repository ==============',
    );
  }

  async saveTxHistory(
    internalChainId: number,
    safeAddress: string,
    txHash: string,
    createdAt: Date,
  ): Promise<TransactionHistory> {
    return this.repos.save(
      new TransactionHistory(internalChainId, safeAddress, txHash, createdAt),
    );
  }

  async getTxHistoryBySafeAddress(
    safeAddress: string,
    internalChainId: number,
    pageIndex: number,
    limit: number,
  ) {
    const offset = limit * (pageIndex - 1);
    // query transactions from aura_tx
    // set direction of transaction

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result: unknown[] = await this.repos.query(
      `
      SELECT AT.Id as AuraTxId, MT.Id as MultisigTxId, AT.TxHash as TxHash, MT.TypeUrl as TypeUrl, AT.FromAddress as FromAddress, AT.Amount as AuraTxAmount, AT.RewardAmount as AuraTxRewardAmount, MT.Amount as MultisigTxAmount, AT.Code as Status, MT.Sequence as Sequence, AT.CreatedAt as CreatedAt, AT.UpdatedAt as UpdatedAt, AT.Timestamp as Timestamp 
      FROM TransactionHistory TH
        INNER JOIN AuraTx AT on TH.TxHash = AT.TxHash
        LEFT JOIN MultisigTransaction MT on TH.TxHash = MT.TxHash
        WHERE TH.InternalChainId = ?
        AND  TH.SafeAddress = ?
      UNION
      SELECT NULL as AuraTxId,  MT.ID as MultisigTxId, MT.TxHash as TxHash, MT.TypeUrl as TypeUrl, MT.FromAddress as FromAddress, NULL as AuraTxAmount,NULL as AuraTxRewardAmount, MT.Amount as MultisigTxAmount, MT.Status, MT.Sequence as Sequence, MT.CreatedAt as CreatedAt, MT.UpdatedAt as UpdateAt, NULL as Timestamp  FROM MultisigTransaction MT
        WHERE MT.InternalChainId = ?
        AND MT.FromAddress = ?
        AND Status In(?,?,?,?,?)
        AND TxHash IS NULL
      ORDER BY UpdatedAt DESC
      LIMIT ? OFFSET ?;
      `,
      [
        internalChainId,
        safeAddress,
        internalChainId,
        safeAddress,
        TransactionStatus.CANCELLED,
        TransactionStatus.SUCCESS,
        TransactionStatus.FAILED,
        TransactionStatus.REPLACED,
        TransactionStatus.DELETED,
        limit,
        offset,
      ],
    );
    const txs = plainToInstance(MultisigTransactionHistoryResponseDto, result);

    return txs;
  }
}
