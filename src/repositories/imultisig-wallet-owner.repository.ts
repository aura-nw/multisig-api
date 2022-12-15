import { Safe, SafeOwner } from '../entities';
import { IBaseRepository } from './ibase.repository';

export interface IMultisigWalletOwnerRepository extends IBaseRepository {
  /**
   * Get Owners of a Safe
   * @param safeAddress
   */
  getOwners(safeAddress: string): any;

  insertOwners(
    safeId: number,
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
    safeId: number,
    ownerAddress: string,
    ownerPubkey: string,
    internalChainId: number,
  ): Promise<Safe>;

  /**
   * isSafeOwner
   * @param walletAddress
   * @param safeId
   */
  isSafeOwner(walletAddress: string, safeId: number): Promise<boolean>;
}
