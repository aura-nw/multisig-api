import { Safe } from '../entities';
import { IBaseRepository } from './ibase.repository';

export interface IMultisigWalletRepository extends IBaseRepository {
  /**
   *
   * @param safeAddress
   */
  updateQueuedTagByAddress(safeAddress: string): Promise<void>;

  /**
   *
   * @param safeId
   */
  updateQueuedTag(safeId: number): Promise<any>;

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

  deletePendingSafe(safeId: string, myAddress: string): Promise<Safe>;

  insertSafe(
    creatorAddress: string,
    creatorPubkey: string,
    otherOwnersAddress: string[],
    threshold: number,
    internalChainId: number,
    chainPrefix: string,
  ): Promise<Safe>;

  getSafe(safeId: string, internalChainId?: number): Promise<Safe>;
  getPendingSafe(safeId: string, internalChainId?: number): Promise<any>;
  confirmSafe(safe: Safe, pubkeys: string[], prefix: string): Promise<Safe>;
  getCreatedSafe(safeId: string, internalChainId?: number): Promise<Safe>;

  updateSafe(safe: Safe): Promise<void>;
}
