import { Column, Entity } from 'typeorm';
import { BaseEntityAutoId } from './base/base.entity';

@Entity({ name: 'SafeOwner' })
export class SafeOwner extends BaseEntityAutoId {
  @Column({ name: 'SafeId' })
  safeId: string;

  @Column({ name: 'OwnerAddress' })
  ownerAddress: string;

  @Column({ name: 'OwnerPubkey' })
  @Column('varchar', { length: 800, nullable: true })
  ownerPubkey: string;

  // index: [safeId]
}
