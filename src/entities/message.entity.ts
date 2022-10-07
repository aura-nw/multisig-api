import { BaseEntityAutoId } from './base/base.entity';
import { Column, Entity } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity({ name: 'Message' })
export class Message extends BaseEntityAutoId {
  @Expose()
  @Column({ name: 'TxId' })
  txId: number;

  @Expose()
  @Column({ name: 'TypeUrl' })
  typeUrl: string;

  @Expose()
  @Column({ name: 'FromAddress' })
  fromAddress: string;

  @Expose()
  @Column({ name: 'ToAddress' })
  toAddress: string;

  @Expose()
  @Column({ name: 'Amount' })
  amount: string;

  @Expose()
  @Column({ name: 'DelegatorAddress' })
  delegatorAddress: string;

  @Expose()
  @Column({ name: 'ValidatorAddress' })
  validatorAddress: string;

  @Expose()
  @Column({ name: 'ValidatorSrcAddress' })
  validatorSrcAddress: string;

  @Expose()
  @Column({ name: 'ValidatorDstAddress' })
  validatorDstAddress: string;
}
