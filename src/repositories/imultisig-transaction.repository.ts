import { MultisigTransactionHistoryResponse } from 'src/dtos/responses';
import { TxDetailResponse } from 'src/dtos/responses/multisig-transaction/tx-detail.response';
import { MultisigTransaction } from 'src/entities';
import { IBaseRepository } from './ibase.repository';

export interface IMultisigTransactionsRepository extends IBaseRepository {
  /**
   * Get Id of a Multisig Transaction
   * @param internalTxHash
   */
  getMultisigTxId(internalTxHash: string): any;

  /**
   * Get details of a transaction from MultisigTransaction table
   */
  getTransactionDetailsMultisigTransaction(
    condition: any,
  ): Promise<TxDetailResponse>;

  /**
   * Get queue transaction of a Safe
   * @param request
   */
  getQueueTransaction(
    safeAddress: string,
    internalChainId: number,
    pageIndex: number,
    pageSize: number,
  ): Promise<MultisigTransactionHistoryResponse[]>;

  /**
   * Validate transaction
   */
  validateTransaction(transactionId: number, internalChainId: number): any;

  /**
   * Insert data into table multisig transaction
   */
  insertMultisigTransaction(transaction: MultisigTransaction);

  /**
   * Check exist multisig transaction
   */
  checkExistMultisigTransaction(transactionId: number): Promise<any>;

  /**
   * Validate when send tx
   */
  validateTxBroadcast(transactionId: number): Promise<any>;

  /**
   * Update tx when broadcasted success
   */
  updateTxBroadcastSucces(transactionId: number, txHash: string): Promise<any>;

  /**
   * Validate safe don't have pending tx
   */
  validateCreateTx(
    safeAddress: string,
    internalChainId: number,
  ): Promise<boolean>;
}
