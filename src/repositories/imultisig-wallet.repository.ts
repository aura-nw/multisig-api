import { Safe } from 'src/entities';
import { IBaseRepository } from './ibase.repository';

export interface IMultisigWalletRepository extends IBaseRepository {
  /**
   *
   * @param ownerAddress string
   */
  getMultisigWalletsByOwner(
    ownerAddress: string,
    internalChainId: number,
  ): Promise<any[]>;
  /**
   * get multisig wallet information
   */
  checkOwnerMultisigWallet(
    owner_address: string,
    safe_address: string,
    pubkeys: string,
  );

  /**
   * Get Threshold and Creator of Safe
   * @param safeAddress Address of Safe
   */
  getThreshold(safeAddress: string): any;

  deletePendingSafe(condition: any, myAddress: string): Promise<Safe>;
}
