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

    /**
     * Insert data into table multisig transaction
     */
    insertMultisigTransaction(from: string, to: string, amount: number, gasLimit: number, fee: number, 
        accountNumber: number, typeUrl: string, denom: string, status: string, internalChainId: number,
        sequence: string, safeId: number): Promise<any>;

    /**
     * Check exist multisig transaction
     */
    checkExistMultisigTransaction(transactionId: number, internalChainId: number): Promise<any>;

    /**
     * Validate when send tx
     */
    validateTxBroadcast(transactionId: number): Promise<any>;

    /**
     * Update tx when broadcasted success
     */
    updateTxBroadcastSucces(transactionId: number, txHash: string): Promise<any>;
}
