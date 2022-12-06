import { BaseEntityAutoId } from './base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'Safe' })
export class Safe extends BaseEntityAutoId {
  @Column({ name: 'SafeAddress', unique: true, nullable: true })
  safeAddress: string;

  @Column({ name: 'AccountNumber', unique: true, nullable: true })
  accountNumber: string;

  @Column('varchar', { name: 'SafePubkey', nullable: true, length: 800 })
  safePubkey: string;

  @Column({ name: 'CreatorAddress' })
  creatorAddress: string;

  @Column({ name: 'CreatorPubkey' })
  creatorPubkey: string;

  @Column({ name: 'Threshold' })
  threshold: number;

  @Column({ name: 'Status' })
  status: string;

  @Column({ name: 'Sequence', nullable: true })
  sequence: string;

  @Column({ name: 'NextSequence', nullable: true })
  nextSequence: string;

  @Column({ name: 'AddressHash' })
  addressHash: string;

  @Column({ name: 'InternalChainId' })
  internalChainId: number;

  @Column({ name: 'TxHistoryTag' })
  txHistoryTag: string;

  @Column({ name: 'TxQueuedTag' })
  txQueuedTag: string;

  // index: [SafeAddress]
}
