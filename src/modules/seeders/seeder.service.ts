import { validate } from 'class-validator';

import { Injectable, OnModuleInit } from '@nestjs/common';

import { CommonService } from '../../shared/services';
import { ChainRepository } from '../chain/chain.repository';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    private chainRepo: ChainRepository,
    private commonSvc: CommonService,
  ) {}

  async onModuleInit() {
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
