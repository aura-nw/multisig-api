import { MultisigTransactionHistoryResponse } from 'src/dtos/responses';
import { MODULE_REQUEST } from 'src/module.config';
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
  getTransactionDetailsAuraTx(condition: any): any;
}
