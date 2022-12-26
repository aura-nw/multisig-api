import { MultisigTransactionHistoryResponse } from '../dtos/responses';
import {
  TxDetail,
  TxDetailResponse,
} from '../dtos/responses/multisig-transaction/tx-detail.response';
import { IBaseRepository } from './ibase.repository';

export interface ITransactionRepository extends IBaseRepository {
  /**
   *
   * @param take
   * @param skip
   */
  getBatchTx(take: number, skip: number): Promise<any[]>;

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

  getAuraTxDetail(auraTxId: number): Promise<TxDetail>;
}
