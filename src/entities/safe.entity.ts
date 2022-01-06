import { BaseEntityAutoId } from './base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'Safe' })
export class Safe extends BaseEntityAutoId {
  @Column({ name: 'SafeAddress', unique: true, nullable: true })
  safeAddress: string;

  @Column({ name: 'CreatorAddress' })
  creatorAddress: string;

  @Column({ name: 'Threshold' })
  threshold: number;

  @Column('varchar', { name: 'SafePubkey', nullable: true, length: 800 })
  safePubkey: string;

  @Column({ name: 'Status' })
  status: string;

  // index: [SafeAddress]
}
