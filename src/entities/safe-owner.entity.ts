import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'SafeOwner' })
export class SafeOwner {
  @PrimaryColumn({ name: 'SafeId' })
  safeId: string;

  @PrimaryColumn({ name: 'OwnerAddress' })
  ownerAddress: string;

  @Column({ name: 'OwnerPubkey' })
  @Column('varchar', { length: 800 })
  ownerPubkey: string;
}
