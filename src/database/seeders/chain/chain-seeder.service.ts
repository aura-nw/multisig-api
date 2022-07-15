import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chain } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ChainSeederService {
  constructor(
    @InjectRepository(Chain)
    private chainRepos: Repository<Chain>,
  ) {}

  async createOrUpdate(chainInfos: any[]) {
    const result = [];
    for (const chainInfo of chainInfos) {
      let chain = await this.chainRepos.findOne({ chainId: chainInfo.chainId });
      if (!chain) continue;
      chain = {
        ...chain,
        ...chainInfo,
      };
      const res = await this.chainRepos.save(chain);
      result.push(res);
    }
    return result;
  }
}
