import { Column, Entity } from 'typeorm';
import { BaseEntityAutoId } from './base/base.entity';

@Entity({ name: 'AuraTx' })
export class AuraTx extends BaseEntityAutoId {
  @Column({ name: 'Code' })
  code: string;

  @Column({ name: 'CodeSpace' })
  codeSpace: string;

  @Column({ name: 'Data' })
  data: string;

  @Column({ name: 'GasUsed', type: 'float' })
  gasUsed: number;

  @Column({ name: 'GasWanted', type: 'float' })
  gasWanted: number;

  @Column({ name: 'Height' })
  height: number;

  @Column({ name: 'Info' })
  info: string;

  @Column({ name: 'Logs' })
  logs: string;

  @Column({ name: 'RawLogs' })
  rawLogs: string;

  @Column({ name: 'FromAddress' })
  fromAddress: string;

  @Column({ name: 'ToAddress' })
  toAddress: string;

  @Column({ name: 'Amount', type: 'float' })
  amount: number;

  @Column({ name: 'Denom' })
  denom: string;

  @Column({ name: 'TimeStamp', type: 'timestamp' })
  timeStamp: Date;

  @Column({ name: 'Tx' })
  tx: string;

  @Column({ name: 'TxHash' })
  txHash: string;

  @Column({ name: 'InternalChainId' })
  internalChainId: string;
}
