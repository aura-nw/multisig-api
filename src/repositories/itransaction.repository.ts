import { IBaseRepository } from "./ibase.repository";

export interface ITransactionRepository extends IBaseRepository {

    /**
     * Get list of confirmation of Multisig Transaction
     */
    getListConfirmMultisigTransaction(multisigTransactionId: number): any;

    /**
     * Get Id of a Multisig Transaction
     * @param internalTxHash 
     */
    getMultisigTxId(internalTxHash: string): any;
}