import { MultisigTransactionHistoryResponse } from '../dtos/responses';
import {
  TxDetail,
  TxDetailResponse,
} from '../dtos/responses/multisig-transaction/tx-detail.response';
import { MultisigTransaction } from '../entities';
import { IBaseRepository } from './ibase.repository';

export interface IMultisigTransactionsRepository extends IBaseRepository {
  findSequenceInQueue(safeId: number): Promise<number[]>;
  /**
   * Get Id of a Multisig Transaction
   * @param internalTxHash
   */
  getMultisigTxId(internalTxHash: string): any;

  getMultisigTxDetail(multisigTxId: number): Promise<TxDetail>;

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
   * Update status of a transaction if it satisfies the threshold
   * @param transactionId
   * @param safeId
   * @param internalChainId
   */
  updateTxStatusIfSatisfied(
    transactionId: number,
    safeId: number,
    internalChainId: number,
  );

  /**
   * Insert data into table multisig transaction
   */
  insertMultisigTransaction(transaction: MultisigTransaction);

  /**
   * Get multisig transaction by id
   * @param transactionId
   */
  getTransactionById(transactionId: number): Promise<MultisigTransaction>;

  /**
   * Get broadcastable transaction by txId
   * @param transactionId
   */
  getBroadcastableTx(transactionId: number): Promise<any>;

  /**
   * Update tx when broadcasted success
   */
  updateTxBroadcastSuccess(transactionId: number, txHash: string): Promise<any>;

  /**
   * Validate safe don't have pending tx
   */
  validateCreateTx(
    safeAddress: string,
    internalChainId: number,
  ): Promise<boolean>;
}
