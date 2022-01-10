import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'AuraTx' })
export class AuraTx {
  @PrimaryColumn({ name: 'Id' })
  id: string;

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
  height: string;

  @Column({ name: 'Info' })
  info: string;

  @Column({ name: 'Logs' })
  logs: string;

  @Column({ name: 'RawLogs' })
  rawLogs: string;

  @Column({ name: 'TimeStamp', type: 'timestamp' })
  timeStamp: Date;

  @Column({ name: 'Tx' })
  tx: string;

  @Column({ name: 'TxHash' })
  txHash: string;
}
