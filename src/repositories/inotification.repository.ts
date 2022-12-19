import { IBaseRepository } from './ibase.repository';

export interface INotificationRepository extends IBaseRepository {
  notifyAllowSafe(
    safeId: number,
    creatorAddress: string,
    otherOwnersAddress: string[],
  ): Promise<void>;

  notifySafeCreated(
    safeId: number,
    safeAddress: string,
    ownerAddresses: string[],
  ): Promise<void>;
}
