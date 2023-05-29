import { Injectable } from '@nestjs/common';
import { validate } from 'class-validator';
import { ChainRepository } from '../chain/chain.repository';
import { CommonService } from '../../shared/services';

@Injectable()
export class SeederService {
  constructor(
    private chainRepo: ChainRepository,
    private commonSvc: CommonService,
  ) {}

  async seed() {
    await this.seedChain();
  }

  async seedChain() {
    try {
      const chainInfos = await this.commonSvc.readConfigurationFile();

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
