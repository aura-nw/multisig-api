import { SmartContractTx } from 'src/entities';
import { IBaseRepository } from './ibase.repository';

export interface ISmartContractRepository extends IBaseRepository {
  /**
   * Validate safe don't have pending tx
   */
  validateCreateTx(from: string, internalChainId: number): Promise<any>;

  /**
   * Insert data into smart contract tx table
   */
  insertExecuteContract(contractTx: SmartContractTx): Promise<any>;

  /**
   * Check exist smart contract tx
   */
  checkExistSmartContractTx(
    smartContractTxId: number,
    internalChainId: number,
  ): Promise<any>;

  /**
   * Validate transaction
   */
  validateTransaction(transactionId: number, internalChainId: number): any;

  /**
   * Validate when send tx
   */
  validateTxBroadcast(transactionId: number): Promise<any>;

  /**
   * Update tx when broadcasted success
   */
  updateTxBroadcastSucces(transactionId: number, txHash: string): Promise<any>;
}
