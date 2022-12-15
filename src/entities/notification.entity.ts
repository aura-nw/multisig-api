import { plainToInstance } from 'class-transformer';
import {
  NotificationEventType,
  NotificationStatus,
} from 'src/common/constants/app.constant';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntityAutoId } from './base/base.entity';

@Entity({ name: 'Notification' })
export class Notification extends BaseEntityAutoId {
  @Column({ name: 'UserId' })
  @Index()
  userId: number;

  @Column({ name: 'EventType', enum: NotificationEventType })
  eventType: string;

  @Column({ name: 'SafeId', nullable: true })
  safeId: number;

  @Column({ name: 'SafeCreatorAddress', nullable: true })
  safeCreatorAddress: string;

  @Column({ name: 'SafeAddress', nullable: true })
  safeAddress: string;

  @Column({ name: 'SafeOwnerNum', nullable: true })
  safeOwnerNum: number;

  @Column({ name: 'TxId', nullable: true })
  txId: number;

  @Column({ name: 'TxCreatorAddress', nullable: true })
  txCreatorAddress: string;

  @Column({ name: 'TxSequence', nullable: true })
  sequence: number;

  @Column({ name: 'ProposalNumber', nullable: true })
  proposalNumber: number;

  @Column({ name: 'ProposalName', nullable: true })
  proposalName: string;

  @Column({ name: 'ProposalEndDate', nullable: true })
  proposalEndDate: Date;

  @Column({ name: 'Status', enum: NotificationStatus })
  status: string;

  static newWaitAllowSafeNotification(
    userId: number,
    safeId: number,
    safeCreatorAddress: string,
    safeOwnerNum: number,
  ): Notification {
    return plainToInstance(Notification, {
      userId,
      eventType: NotificationEventType.WAIT_ALLOW_SAFE,
      safeId,
      safeCreatorAddress,
      safeOwnerNum,
      status: NotificationStatus.UNREAD,
    });
  }
}
