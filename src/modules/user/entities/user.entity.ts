import { Column, Entity } from 'typeorm';
import { BaseEntityAutoId } from '../../../common/base.entity';

@Entity({ name: 'User' })
export class User extends BaseEntityAutoId {
  @Column({ name: 'Address', unique: true, nullable: false })
  address: string;

  @Column('varchar', {
    name: 'Pubkey',
    unique: true,
    nullable: false,
    length: 800,
  })
  pubkey: string;
}
