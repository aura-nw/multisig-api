import { BaseEntityAutoId } from './base/base.entity';
import { Column, Entity } from 'typeorm';
import { ConfigService } from 'src/shared/services/config.service';

@Entity({ name: 'Safe' })
export class Safe extends BaseEntityAutoId {
  private configService = new ConfigService();

  @Column({ name: 'SafeAddress', unique: true, nullable: true })
  safeAddress: string;

  @Column('varchar', { name: 'SafePubkey', nullable: true, length: 800 })
  safePubkey: string;

  @Column({ name: 'CreatorAddress' })
  creatorAddress: string;

  @Column({ name: 'CreatorPubkey' })
  creatorPubkey: string;

  @Column({ name: 'Threshold' })
  threshold: number;

  @Column({ name: 'Status' })
  status: string;

  @Column({ name: 'ChainId' })
  chainId: number = Number(this.configService.get('CHAIN_ID'));

  // index: [SafeAddress]
}
