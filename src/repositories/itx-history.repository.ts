import { TransactionHistory } from '../entities/transaction-history.entity';
import { IBaseRepository } from './ibase.repository';

export interface ITransactionHistoryRepository extends IBaseRepository {
  saveTxHistory(
    internalChainId: number,
    safeAddress: string,
    txHash: string,
    createdAt: string,
  ): Promise<TransactionHistory>;

  getTxHistoryBySafeAddress(
    safeAddress: string,
    internalChainId: number,
    pageIndex: number,
    limit: number,
  );
}
