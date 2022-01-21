import { IBaseRepository } from './ibase.repository';

export interface IMultisigWalletRepository extends IBaseRepository {
  /**
   *
   * @param ownerAddress string
   */
  getMultisigWalletsByOwner(ownerAddress: string, chainId: number): Promise<any[]>;
  /**
   * get multisig wallet information
   */
  checkOwnerMultisigWallet(
    owner_address: string,
    safe_address: string,
    pubkeys: string,
  );
}
