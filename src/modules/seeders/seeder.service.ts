import { Injectable } from '@nestjs/common';
import { validate } from 'class-validator';
import { CommonUtil } from '../../utils/common.util';
import { ChainInfo } from '../../utils/validations/chain.validation';
import { ChainRepository } from '../chain/chain.repository';

@Injectable()
export class SeederService {
  constructor(private chainRepo: ChainRepository) {}

  async seed() {
    await this.seedChain();
  }

  async seedChain() {
    try {
      const chainInfos = await CommonUtil.jsonReader<ChainInfo[]>(
        './chains.json',
      );

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
