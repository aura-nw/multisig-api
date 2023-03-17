import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, Repository } from 'typeorm';
import { CustomError } from '../../common/custom-error';
import { ErrorMap } from '../../common/error.map';
import { ChainInfo } from '../../utils/validations/chain.validation';
import { Chain } from './entities/chain.entity';

@Injectable()
export class ChainRepository {
  private readonly logger = new Logger(ChainRepository.name);

  constructor(
    @InjectRepository(Chain)
    private readonly repos: Repository<Chain>,
  ) {
    this.logger.log(
      '============== Constructor Chain Repository ==============',
    );
  }

  /**
   * createOrUpdate
   * @param chainInfos
   * @returns
   */
  async createOrUpdate(chainInfos: ChainInfo[]) {
    const chainIds = chainInfos.map((chainInfo) => chainInfo.chainId);
    const chains = await this.repos.find({
      where: {
        chainId: In(chainIds),
      },
    });

    const chainsToCreateOrUpdate: Chain[] = [];

    for (const chainInfo of chainInfos) {
      let chainToUpdate = chains.find(
        (chain) => chain.chainId === chainInfo.chainId,
      );
      chainToUpdate = { ...chainToUpdate, ...chainInfo };
      chainsToCreateOrUpdate.push(plainToInstance(Chain, chainToUpdate));
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

  /**
   * findChain
   * @param internalChainId
   * @returns
   */
  async findChain(internalChainId: number): Promise<Chain> {
    const chainInfo = await this.repos.findOne({
      where: {
        id: internalChainId,
      },
    });
    if (!chainInfo) throw new CustomError(ErrorMap.CHAIN_ID_NOT_EXIST);
    return chainInfo;
  }

  /**
   * findChainByChainId
   * @param chainId
   * @returns
   */
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
