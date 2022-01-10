import { IBaseRepository } from './ibase.repository';

export interface IMultisigWalletRepository extends IBaseRepository {
  /**
   *
   * @param ownerAddress string
   */
  getMultisigWalletsByOwner(ownerAddress: string): any;
  /**
   * get multisig wallet information
   */
  getMultisigWalletInformation(
    safe_address: string,
    chainId: string,
    pubkeys: string,
  );
}
