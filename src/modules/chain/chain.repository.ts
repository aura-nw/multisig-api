import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import { ChainInfo } from '../../utils/validations/chain.validation';
import { Chain } from './entities/chain.entity';

@Injectable()
export class ChainRepository {
  private readonly _logger = new Logger(ChainRepository.name);
  constructor(
    @InjectRepository(Chain)
    private readonly repos: Repository<Chain>,
  ) {
    this._logger.log(
      '============== Constructor Chain Repository ==============',
    );
  }

  async createOrUpdate(chainInfos: ChainInfo[]) {
    const chainIds = chainInfos.map((chainInfo) => {
      return chainInfo.chainId;
    });
    const chains = await this.repos
      .createQueryBuilder()
      .where('Chain.ChainId IN (:...chainIds)', { chainIds })
      .getMany();

    const chainsToCreateOrUpdate = [];

    for (const chainInfo of chainInfos) {
      let chainToUpdate = chains.find((chain) => {
        return chain.chainId === chainInfo.chainId;
      });
      chainToUpdate = { ...chainToUpdate, ...chainInfo };
      chainsToCreateOrUpdate.push(chainToUpdate);
    }
    const res = await this.repos.save(chainsToCreateOrUpdate);
    return res;
  }

  /**
   * showNetworkList
   * @returns
   */
  async showNetworkList(): Promise<Chain[]> {
    return this.repos.find();
  }

  async findChain(internalChainId: number): Promise<Chain> {
    const chainInfo = await this.repos.findOne({
      where: {
        id: internalChainId,
      },
    });
    if (!chainInfo) throw new CustomError(ErrorMap.CHAIN_ID_NOT_EXIST);
    return chainInfo;
  }

  async findChainByChainId(chainId: string): Promise<Chain> {
    const chainInfo = await this.repos.findOne({
      where: {
        chainId,
      },
    });
    if (!chainInfo) throw new CustomError(ErrorMap.CHAIN_ID_NOT_EXIST);
    return chainInfo;
  }
}
