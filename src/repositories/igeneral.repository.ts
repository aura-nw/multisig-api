import { Chain } from 'src/entities';
import { IBaseRepository } from './ibase.repository';

export interface IGeneralRepository extends IBaseRepository {
  /**
   * Show network list
   */
  showNetworkList(): any;

  findChain(internalChainId: number): Promise<Chain>;
}
