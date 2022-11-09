import { MultisigTransactionHistoryResponse } from '../dtos/responses';
import { TxDetailResponse } from '../dtos/responses/multisig-transaction/tx-detail.response';
import { IBaseRepository } from './ibase.repository';

export interface ITransactionRepository extends IBaseRepository {
  /**
   * Get all Transactions from AuraTx DB
   * @param safeAddress
   */
  getAuraTx(
    safeAddress: string,
    internalChainId: number,
    pageIndex: number,
    pageSize: number,
  ): Promise<MultisigTransactionHistoryResponse[]>;

  /**
   * Get details of a transaction from AuraTx table
   */
  getTransactionDetailsAuraTx(txHash: string): Promise<TxDetailResponse>;
}
