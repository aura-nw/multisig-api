import { IBaseRepository } from './ibase.repository';

export interface IMultisigWalletOwnerRepository extends IBaseRepository {
  /**
   * Get Owners of a Safe
   * @param safeAddress 
   */
  getOwners(safeAddress: string): any;
}
