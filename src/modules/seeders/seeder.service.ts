import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ChainInfo } from '../../utils/validations/chain.validation';
import { ChainRepository } from '../chain/chain.repository';
import networkConfig from '../../chains.json';

@Injectable()
export class SeederService {
  constructor(private chainRepo: ChainRepository) {}

  async seed() {
    await this.seedChain();
  }

  async seedChain() {
    try {
      const chainInfos: ChainInfo[] = plainToInstance(ChainInfo, networkConfig);
      const validateResult = await Promise.all(
        chainInfos.map((chainInfo) => validate(chainInfo)),
      );
      const errors = validateResult.filter((error) => error.length > 0);
      if (errors.length > 0) {
        throw new Error(errors.toString());
      }
      await this.chainRepo.createOrUpdate(chainInfos);
    } catch {
      throw new Error('seeding chain failed');
    }
  }
}
