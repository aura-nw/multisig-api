import { BaseEntityAutoId } from './base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'Safe' })
export class Safe extends BaseEntityAutoId {
  @Column({ name: 'SafeAddress' })
  safeAddress: string;

  @Column({ name: 'CreatorAddress' })
  creatorAddress: string;

  @Column({ name: 'Threshold' })
  threshold: number;

  @Column({ name: 'SafePubkey' })
  @Column('varchar', { length: 800 })
  safePubkey: string;

  @Column({ name: 'Status' })
  status: string;
}
