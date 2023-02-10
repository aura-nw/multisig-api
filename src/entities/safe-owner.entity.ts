import { Column, Entity } from 'typeorm';
import { BaseEntityAutoId } from '../common/base.entity';

@Entity({ name: 'SafeOwner' })
export class SafeOwner extends BaseEntityAutoId {
  @Column({ name: 'SafeId' })
  safeId: number;

  @Column({ name: 'OwnerAddress' })
  ownerAddress: string;

  @Column({ name: 'OwnerPubkey' })
  @Column('varchar', { length: 800, nullable: true })
  ownerPubkey: string;

  @Column({ name: 'InternalChainId' })
  internalChainId: number;

  // index: [safeId]
}
