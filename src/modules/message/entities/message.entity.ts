import { Column, Entity } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntityAutoId } from '../../../common/entities';

@Entity({ name: 'Message' })
export class Message extends BaseEntityAutoId {
  @Expose()
  @Column({ name: 'TxId' })
  txId: number;

  @Expose()
  @Column({ name: 'AuraTxId' })
  auraTxId: number;

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
  @Column({ name: 'Denom' })
  denom: string;

  @Expose()
  @Column({ name: 'Inputs' })
  inputs: string;

  @Expose()
  @Column({ name: 'Outputs' })
  outputs: string;

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

  @Expose()
  @Column({ name: 'VoteOption' })
  voteOption: number;

  @Expose()
  @Column({ name: 'ProposalId' })
  proposalId: number;

  @Expose()
  @Column({ name: 'Voter' })
  voter: string;

  @Expose()
  @Column({ name: 'ContractSender' })
  contractSender: string;

  @Expose()
  @Column({ name: 'ContractAddress' })
  contractAddress: string;

  @Expose()
  @Column({ name: 'ContractFunction' })
  contractFunction: string;

  @Expose()
  @Column({ name: 'ContractArgs' })
  contractArgs: string;

  @Expose()
  @Column({ name: 'ContractFunds' })
  contractFunds: string;
}
