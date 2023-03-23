import { TRANSACTION_STATUS } from '../common/constants/app.constant';
import { MultisigTransactionHistoryResponse } from '../dtos/responses';
import {
  TxDetail,
  TxDetailResponse,
} from '../dtos/responses/multisig-transaction/tx-detail.response';
import { MultisigTransaction } from '../entities';
import { IBaseRepository } from './ibase.repository';

export interface IMultisigTransactionsRepository extends IBaseRepository {
  /**
   * deleteTx by update status to DELETED
   * @param id
   */
  deleteTx(id: number): Promise<void>;

  /**
   * updateQueueTxToReplaced
   * @param safeId
   * @param sequence
   */
  updateQueueTxToReplaced(safeId: number, sequence: number);

  /**
   * findSequenceInQueue
   * @param safeId
   */
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
   * Return true if it satisfies the threshold
   * @param transactionId
   * @param safeId
   * @param internalChainId
   */
  isExecutable(
    transactionId: number,
    safeId: number,
    internalChainId: number,
  ): Promise<boolean>;

  updateAwaitingExecutionTx(multisigTxId: number): Promise<MultisigTransaction>;

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
  getBroadcastableTx(transactionId: number): Promise<MultisigTransaction>;

  /**
   * updateTxToExecuting
   * @param transactionId
   */
  updateTxToExecuting(transactionId: number): Promise<void>;

  /**
   * Update executing tx
   */
  updateExecutingTx(
    transactionId: number,
    status: TRANSACTION_STATUS,
    txHash?: string,
  ): Promise<void>;

  /**
   * Validate safe don't have pending tx
   */
  // validateCreateTx(
  //   safeAddress: string,
  //   internalChainId: number,
  // ): Promise<boolean>;
}
