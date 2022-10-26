import { Chain } from '../entities';
import { IBaseRepository } from './ibase.repository';

export interface IGeneralRepository extends IBaseRepository {
  /**
   * Show network list
   */
  showNetworkList(): any;

  findChain(internalChainId: number): Promise<Chain>;
  findChainByChainId(chainId: string): Promise<Chain>;
}
