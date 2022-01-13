import { ConfigService } from 'src/shared/services/config.service';
import { Column, Entity } from 'typeorm';
import { BaseEntityAutoId } from './base/base.entity';

@Entity({ name: 'SafeOwner' })
export class SafeOwner extends BaseEntityAutoId {
  private configService = new ConfigService();

  @Column({ name: 'SafeId' })
  safeId: string;

  @Column({ name: 'OwnerAddress' })
  ownerAddress: string;

  @Column({ name: 'OwnerPubkey' })
  @Column('varchar', { length: 800, nullable: true })
  ownerPubkey: string;

  @Column({ name: 'ChainId' })
  chainId: number = Number(this.configService.get('CHAIN_ID'));

  // index: [safeId]
}
