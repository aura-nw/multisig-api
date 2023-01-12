import { IBaseRepository } from './ibase.repository';

export interface INotificationRepository extends IBaseRepository {
  notifyAllowSafe(
    safeId: number,
    creatorAddress: string,
    otherOwnersAddress: string[],
    internalChainId: number,
  ): Promise<void>;

  notifySafeCreated(
    safeId: number,
    safeAddress: string,
    ownerAddresses: string[],
    internalChainId: number,
  ): Promise<void>;

  notifyNewTx(
    safeId: number,
    safeAddress: string,
    multisigTxId: number,
    sequence: number,
    txCreatorAddress: string,
    otherOwnersAddress: string[],
    internalChainId: number,
  ): Promise<void>;

  notifyExecutableTx(
    safeId: number,
    safeAddress: string,
    multisigTxId: number,
    sequence: number,
    ownerAddresses: string[],
    internalChainId: number,
  ): Promise<void>;

  notifyBroadcastedTx(
    safeId: number,
    safeAddress: string,
    multisigTxId: number,
    sequence: number,
    ownerAddresses: string[],
    internalChainId: number,
  ): Promise<void>;

  notifyDeletedTx(
    safeId: number,
    safeAddress: string,
    multisigTxId: number,
    sequence: number,
    ownerAddresses: string[],
    txCreatorAddress: string,
    internalChainId: number,
  ): Promise<void>;
}
