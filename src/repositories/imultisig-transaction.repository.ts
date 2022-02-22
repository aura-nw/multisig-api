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
     getTransactionDetailsMultisigTransaction(condition: any): any;
}
