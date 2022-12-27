import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'TransactionHistory' })
export class TransactionHistory {
  @PrimaryColumn({
    name: 'SafeAddress',
    type: String,
  })
  safeAddress: string;

  @PrimaryColumn({
    name: 'TxHash',
    type: String,
  })
  txHash: string;

  @Column({
    name: 'CreatedAt',
    type: Date,
  })
  createdAt: Date;

  constructor(safeAddress: string, txHash: string, createdAt: string) {
    this.safeAddress = safeAddress;
    this.txHash = txHash;
    this.createdAt = new Date(createdAt);
  }
}
