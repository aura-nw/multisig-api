import { IBaseRepository } from './ibase.repository';

export interface IMultisigConfirmRepository extends IBaseRepository {
  /**
   * Get list of confirmation of Multisig Transaction
   */
  getListConfirmMultisigTransaction(
    multisigTransactionId: number,
    status?: string,
  ): any;

  /**
   * Validate owner
   */
  validateOwner(
    ownerAddres: string,
    transactionAddress: string,
    internalChainId: number,
  ): Promise<any>;

  /**
   * Check user has confirmed transaction before
   */
  checkUserHasSigned(transactionId: number, ownerAddress: string): Promise<any>;

  /**
   * Insert into table MultisigConfirm
   */
  insertIntoMultisigConfirm(
    multisigTransactionId: number,
    ownerAddress: string,
    signature: string,
    bodyBytes: string,
    internalChainId: number,
    status: string,
  );

  /**
   * Insert into table a signature to execute smart contract
   */
  insertIntoMultisigConfirmContractType(
    smartContractTxId: number,
    ownerAddress: string,
    signature: string,
    bodyBytes: string,
    internalChainId: number,
    status: string,
  );

  /**
   * Get list of confirmation with owner's pubkey
   * @param multisigTransactionId
   */
  getListConfirmWithPubkey(
    multisigTransactionId: number,
    status: string,
    safeId: number,
  ): any;
}
