import { Column, Entity } from 'typeorm';
import { BaseEntityAutoId } from './base/base.entity';

@Entity({ name: 'Chain' })
export class Chain extends BaseEntityAutoId {
  @Column({ name: 'Name' })
  name: string;

  @Column({ name: 'Rest' })
  rest: string;

  @Column({ name: 'Rpc' })
  rpc: string;

  @Column({ name: 'Websocket' })
  webSocket: string;

  @Column({ name: 'Symbol' })
  symbol: string;

  @Column({ name: 'Denom' })
  denom: string;

  @Column({ name: 'ChainId' })
  chainId: string;

  @Column({ name: 'Prefix' })
  prefix: string;
}
