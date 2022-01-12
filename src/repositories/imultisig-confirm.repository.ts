import { IBaseRepository } from "./ibase.repository";

export interface IMultisigConfirmRepository extends IBaseRepository {
    /**
     * Get list of confirmation of Multisig Transaction
     */
    getListConfirmMultisigTransaction(multisigTransactionId: number): any;
}