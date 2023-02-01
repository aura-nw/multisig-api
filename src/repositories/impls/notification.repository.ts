import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notification, User } from '../../entities';
import { ENTITIES_CONFIG } from '../../module.config';
import { INotificationRepository } from '../inotification.repository';
import { BaseRepository } from './base.repository';

@Injectable()
export class NotificationRepository
  extends BaseRepository
  implements INotificationRepository
{
  private readonly _logger = new Logger(NotificationRepository.name);

  constructor(
    @InjectRepository(ENTITIES_CONFIG.NOTIFICATION)
    private readonly repo: Repository<Notification>,

    @InjectRepository(ENTITIES_CONFIG.USER)
    private readonly userRepo: Repository<User>,
  ) {
    super(repo);
    this._logger.log(
      '============== Constructor Notification Repository ==============',
    );
  }

  async notifyAllowSafe(
    safeId: number,
    creatorAddress: string,
    otherOwnersAddress: string[],
    internalChainId: number,
  ): Promise<void> {
    const users = await this.userRepo.find({
      where: {
        address: In(otherOwnersAddress),
      },
    });
    const notifications = users.map((user) => {
      return Notification.newWaitAllowSafeNotification(
        user.id,
        safeId,
        creatorAddress,
        users.length + 1,
        internalChainId,
      );
    });

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
    const users = await this.userRepo.find({
      where: {
        address: In(ownerAddresses),
      },
    });
    const notifications = users.map((user) => {
      return Notification.newSafeCreatedNotification(
        user.id,
        safeId,
        safeAddress,
        internalChainId,
      );
    });

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
    const users = await this.userRepo.find({
      where: {
        address: In(otherOwnersAddress),
      },
    });
    const notifications = users.map((user) => {
      return Notification.newTxNotification(
        user.id,
        safeId,
        multisigTxId,
        sequence,
        safeAddress,
        txCreatorAddress,
        internalChainId,
      );
    });

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
    const users = await this.userRepo.find({
      where: {
        address: In(ownerAddresses),
      },
    });
    const notifications = users.map((user) => {
      return Notification.newTxExecutableNotification(
        user.id,
        safeId,
        multisigTxId,
        sequence,
        safeAddress,
        internalChainId,
      );
    });

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
    const users = await this.userRepo.find({
      where: {
        address: In(ownerAddresses),
      },
    });
    const notifications = users.map((user) => {
      return Notification.newTxBroadcastedNotification(
        user.id,
        safeId,
        multisigTxId,
        sequence,
        safeAddress,
        internalChainId,
      );
    });

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
    const users = await this.userRepo.find({
      where: {
        address: In(ownerAddresses),
      },
    });
    const notifications = users.map((user) => {
      return Notification.newDeletedTxNotification(
        user.id,
        safeId,
        multisigTxId,
        sequence,
        safeAddress,
        txCreatorAddress,
        internalChainId,
      );
    });

    if (notifications.length > 0) {
      await this.repo.save(notifications);
    }
  }
}
