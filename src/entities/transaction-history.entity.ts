import { Entity, PrimaryColumn } from 'typeorm';

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

  constructor(safeAddress: string, txHash: string) {
    this.safeAddress = safeAddress;
    this.txHash = txHash;
  }
}
