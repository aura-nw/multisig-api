import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, UpdateResult } from 'typeorm';
import { NotificationStatus } from '../../common/constants/app.constant';
import { UserRepository } from '../user/user.repository';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationRepository {
  private readonly _logger = new Logger(NotificationRepository.name);

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    private readonly userRepo: UserRepository,
  ) {
    this._logger.log(
      '============== Constructor Notification Repository ==============',
    );
  }

  async saveNotification(notifications: Notification[]) {
    return this.repo.save(notifications);
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return this.repo.find({
      where: { userId },
      order: { id: 'DESC' },
    });
  }

  async markNotificationsAsRead(
    notifications: number[],
    userId: number,
  ): Promise<UpdateResult> {
    return this.repo.update(
      {
        id: In(notifications),
        userId,
      },
      {
        status: NotificationStatus.READ,
      },
    );
  }

  async notifyAllowSafe(
    safeId: number,
    creatorAddress: string,
    otherOwnersAddress: string[],
    internalChainId: number,
  ): Promise<void> {
    const users = await this.userRepo.getUsersByListAddress(otherOwnersAddress);
    const notifications = users.map((user) => Notification.newWaitAllowSafeNotification(
        user.id,
        safeId,
        creatorAddress,
        users.length + 1,
        internalChainId,
      ));

    if (notifications.length > 0) {
      await this.repo.save(notifications);
    }
  }

  async notifySafeCreated(
    safeId: number,
    safeAddress: string,
    ownerAddresses: string[],
    internalChainId: number,
  ): Promise<void> {
    const users = await this.userRepo.getUsersByListAddress(ownerAddresses);
    const notifications = users.map((user) => Notification.newSafeCreatedNotification(
        user.id,
        safeId,
        safeAddress,
        internalChainId,
      ));

    if (notifications.length > 0) {
      await this.repo.save(notifications);
    }
  }

  async notifyNewTx(
    safeId: number,
    safeAddress: string,
    multisigTxId: number,
    sequence: number,
    txCreatorAddress: string,
    otherOwnersAddress: string[],
    internalChainId: number,
  ): Promise<void> {
    const users = await this.userRepo.getUsersByListAddress(otherOwnersAddress);
    const notifications = users.map((user) => Notification.newTxNotification(
        user.id,
        safeId,
        multisigTxId,
        sequence,
        safeAddress,
        txCreatorAddress,
        internalChainId,
      ));

    if (notifications.length > 0) {
      await this.repo.save(notifications);
    }
  }

  async notifyExecutableTx(
    safeId: number,
    safeAddress: string,
    multisigTxId: number,
    sequence: number,
    ownerAddresses: string[],
    internalChainId: number,
  ): Promise<void> {
    const users = await this.userRepo.getUsersByListAddress(ownerAddresses);
    const notifications = users.map((user) => Notification.newTxExecutableNotification(
        user.id,
        safeId,
        multisigTxId,
        sequence,
        safeAddress,
        internalChainId,
      ));

    if (notifications.length > 0) {
      await this.repo.save(notifications);
    }
  }

  async notifyBroadcastedTx(
    safeId: number,
    safeAddress: string,
    multisigTxId: number,
    sequence: number,
    ownerAddresses: string[],
    internalChainId: number,
  ): Promise<void> {
    const users = await this.userRepo.getUsersByListAddress(ownerAddresses);
    const notifications = users.map((user) => Notification.newTxBroadcastedNotification(
        user.id,
        safeId,
        multisigTxId,
        sequence,
        safeAddress,
        internalChainId,
      ));

    if (notifications.length > 0) {
      await this.repo.save(notifications);
    }
  }

  async notifyDeletedTx(
    safeId: number,
    safeAddress: string,
    multisigTxId: number,
    sequence: number,
    ownerAddresses: string[],
    txCreatorAddress: string,
    internalChainId: number,
  ): Promise<void> {
    const users = await this.userRepo.getUsersByListAddress(ownerAddresses);
    const notifications = users.map((user) => Notification.newDeletedTxNotification(
        user.id,
        safeId,
        multisigTxId,
        sequence,
        safeAddress,
        txCreatorAddress,
        internalChainId,
      ));

    if (notifications.length > 0) {
      await this.repo.save(notifications);
    }
  }
}
