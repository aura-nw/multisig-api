import { BaseEntityAutoId } from './base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'Safe' })
export class Safe extends BaseEntityAutoId {
  @Column({ name: 'Address' })
  address: string;

  @Column({ name: 'Owner' })
  owner: string;

  @Column({ name: 'Threshold' })
  threshold: number;

  @Column({ name: 'Pubkey' })
  pubkey: string;
}
