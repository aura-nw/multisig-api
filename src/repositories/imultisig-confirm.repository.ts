import { IBaseRepository } from "./ibase.repository";

export interface IMultisigConfirmRepository extends IBaseRepository {
    /**
     * Get list of confirmation of Multisig Transaction
     */
    getListConfirmMultisigTransaction(multisigTransactionId: number, status?: string): any;

    /**
     * Validate owner
     */
    validateOwner(ownerAddres: string, transactionAddress: string, internalChainId: number): any;

    /**
     * Check user has confirmed transaction before
     */
    checkUserHasSigned(transactionId: number, ownerAddress: string): any;

}
