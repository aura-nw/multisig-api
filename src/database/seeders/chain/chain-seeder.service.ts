import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chain } from 'src/entities';
import { ChainInfo } from 'src/utils/validations/chain.validation';
import { Repository } from 'typeorm';

@Injectable()
export class ChainSeederService {
  constructor(
    @InjectRepository(Chain)
    private chainRepos: Repository<Chain>,
  ) {}

  async createOrUpdate(chainInfos: ChainInfo[]) {
    const chainIds = chainInfos.map((chainInfo) => {
      return chainInfo.chainId;
    });
    const chains = await this.chainRepos
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
    const res = await this.chainRepos.save(chainsToCreateOrUpdate);
    return res;
  }
}
