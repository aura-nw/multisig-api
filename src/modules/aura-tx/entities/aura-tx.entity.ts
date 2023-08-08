import { Column, Entity } from 'typeorm';
import { BaseEntityAutoId } from '../../../common/entities';

@Entity({ name: 'AuraTx' })
export class AuraTx extends BaseEntityAutoId {
  @Column({ name: 'Code' })
  code: string;

  @Column({ name: 'GasUsed', type: 'float' })
  gasUsed: number;

  @Column({ name: 'GasWanted', type: 'float' })
  gasWanted: number;

  @Column({ name: 'Fee', type: 'float' })
  fee: number;

  @Column({ name: 'Height' })
  height: number;

  @Column({ name: 'RawLogs' })
  rawLogs: string;

  @Column({ name: 'FromAddress' })
  fromAddress: string;

  @Column({ name: 'ToAddress' })
  toAddress: string;

  @Column({ name: 'Amount', type: 'float' })
  amount: number;

  @Column({ name: 'RewardAmount', type: 'float' })
  rewardAmount: number;

  @Column({ name: 'Denom' })
  denom: string;

  @Column({ name: 'ContractAddress' })
  contractAddress: string;

  @Column({ name: 'TimeStamp', type: 'timestamp' })
  timeStamp: Date;

  @Column({ name: 'TxHash' })
  txHash: string;

  @Column({ name: 'InternalChainId' })
  internalChainId: string;
}
