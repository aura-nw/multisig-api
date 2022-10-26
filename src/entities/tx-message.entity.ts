import { BaseEntityAutoId } from './base/base.entity';
import { Column, Entity } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity({ name: 'TxMessage' })
export class TxMessage extends BaseEntityAutoId {
  @Expose()
  @Column({ name: 'TxId' })
  txId: number;

  @Expose()
  @Column({ name: 'FromAddress' })
  fromAddress: string;

  @Expose()
  @Column({ name: 'ToAddress' })
  toAddress: string;

  @Expose()
  @Column({ name: 'Amount' })
  amount: number;

  @Expose()
  @Column({ name: 'Denom' })
  denom: string;
}
