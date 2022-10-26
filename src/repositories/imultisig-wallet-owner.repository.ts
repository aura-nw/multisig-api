import { SafeOwner } from '../entities';
import { IBaseRepository } from './ibase.repository';

export interface IMultisigWalletOwnerRepository extends IBaseRepository {
  /**
   * Get Owners of a Safe
   * @param safeAddress
   */
  getOwners(safeAddress: string): any;

  insertOwners(
    safeId: string,
    internalChainId: number,
    creatorAddress: string,
    creatorPubkey: string,
    otherOwnersAddress: string[],
  ): any;

  getSafeOwnersWithError(safeId: number): Promise<any>;

  getConfirmSafeStatus(
    safeId: string,
    myAddress: string,
    myPubkey: string,
  ): Promise<{
    safeOwner: SafeOwner;
    fullConfirmed: boolean;
    pubkeys: string[];
  }>;

  updateSafeOwner(safeOwner: SafeOwner): Promise<void>;

  /**
   * Recover safe owner
   */
  recoverSafeOwner(
    safeId: string,
    ownerAddress: string,
    ownerPubkey: string,
    internalChainId: number,
  ): Promise<any>;

  /**
   * isSafeOwner
   * @param walletAddress
   * @param safeId
   */
  isSafeOwner(walletAddress: string, safeId: number): Promise<boolean>;
}
