import { BaseEntityAutoId } from './base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'Safe' })
export class Safe extends BaseEntityAutoId {
  @Column({ name: 'SafeAddress' })
  safe_address: string;

  @Column({ name: 'OwnerAddress' })
  owner_address: string;

  @Column({ name: 'Threshold' })
  threshold: number;

  @Column({ name: 'OwnerPubkey' })
  pubkey: string;

  @Column({ name: 'Status' })
  status: string;
}
