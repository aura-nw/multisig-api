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

  @Column({ name: 'TotalOwner', nullable: true })
  totalOwner: number;

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

  @Column({ name: 'InternalChainId' })
  internalChainId: number;

  static newWaitAllowSafeNotification(
    userId: number,
    safeId: number,
    safeCreatorAddress: string,
    totalOwner: number,
    internalChainId: number,
  ): Notification {
    return plainToInstance(Notification, {
      userId,
      eventType: NotificationEventType.WAIT_ALLOW_SAFE,
      safeId,
      safeCreatorAddress,
      totalOwner,
      status: NotificationStatus.UNREAD,
      internalChainId,
    });
  }

  static newSafeCreatedNotification(
    userId: number,
    safeId: number,
    safeAddress: string,
    internalChainId: number,
  ): Notification {
    return plainToInstance(Notification, {
      eventType: NotificationEventType.SAFE_CREATED,
      status: NotificationStatus.UNREAD,
      userId,
      safeId,
      safeAddress,
      internalChainId,
    });
  }

  static newTxNotification(
    userId: number,
    safeId: number,
    multisigTxId: number,
    sequence: number,
    safeAddress: string,
    txCreatorAddress: string,
    internalChainId: number,
  ): Notification {
    return plainToInstance(Notification, {
      eventType: NotificationEventType.WAIT_CONFIRM_TX,
      status: NotificationStatus.UNREAD,
      txId: multisigTxId,
      sequence,
      userId,
      safeId,
      safeAddress,
      txCreatorAddress,
      internalChainId,
    });
  }

  static newTxExecutableNotification(
    userId: number,
    safeId: number,
    multisigTxId: number,
    sequence: number,
    safeAddress: string,
    internalChainId: number,
  ): Notification {
    return plainToInstance(Notification, {
      eventType: NotificationEventType.WAIT_EXECUTE_TX,
      status: NotificationStatus.UNREAD,
      txId: multisigTxId,
      sequence,
      userId,
      safeId,
      safeAddress,
      internalChainId,
    });
  }

  static newTxBroadcastedNotification(
    userId: number,
    safeId: number,
    multisigTxId: number,
    sequence: number,
    safeAddress: string,
    internalChainId: number,
  ): Notification {
    return plainToInstance(Notification, {
      eventType: NotificationEventType.TX_BROADCASTED,
      status: NotificationStatus.UNREAD,
      txId: multisigTxId,
      sequence,
      userId,
      safeId,
      safeAddress,
      internalChainId,
    });
  }

  static newDeletedTxNotification(
    userId: number,
    safeId: number,
    multisigTxId: number,
    sequence: number,
    safeAddress: string,
    txCreatorAddress: string,
    internalChainId: number,
  ): Notification {
    return plainToInstance(Notification, {
      eventType: NotificationEventType.TX_DELETED,
      status: NotificationStatus.UNREAD,
      txId: multisigTxId,
      sequence,
      userId,
      safeId,
      safeAddress,
      txCreatorAddress,
      internalChainId,
    });
  }
}
