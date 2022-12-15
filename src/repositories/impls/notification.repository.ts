import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, User } from 'src/entities';
import { ENTITIES_CONFIG } from 'src/module.config';
import { In, Repository } from 'typeorm';
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
        users.length,
      );
    });

    if (notifications.length > 0) {
      await this.repo.save(notifications);
    }
  }
}
