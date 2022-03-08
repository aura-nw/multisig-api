import { MODULE_REQUEST } from 'src/module.config';
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

    /**
     * Get queue transaction of a Safe
     * @param request 
     */
    getQueueTransaction(request: MODULE_REQUEST.GetAllTransactionsRequest): any;

    /**
     * Validate transaction
     */
    validateTransaction(transactionId: number, internalChainId: number): any;
}
