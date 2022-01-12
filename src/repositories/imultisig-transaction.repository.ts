import { IBaseRepository } from './ibase.repository';

export interface IMultisigTransactionsRepository extends IBaseRepository {
    /**
     * Get Id of a Multisig Transaction
     * @param internalTxHash 
     */
    getMultisigTxId(internalTxHash: string): any;
 
     /**
      * Get Multisig Transation History
      */
     getTransactionHistory(safeAddress: string): any;
}
