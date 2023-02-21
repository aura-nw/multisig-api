import { Injectable, Logger } from '@nestjs/common';
import * as path from 'node:path';
import { CommonUtil } from '../../utils/common.util';
import { validateChainInfo } from '../../utils/validations/chain.validation';
import { ChainRepository } from '../chain/chain.repository';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  private commonUtil: CommonUtil = new CommonUtil();

  constructor(private chainRepo: ChainRepository) {}

  async seed() {
    await this.seedChain();
  }

  async seedChain() {
    try {
      this.commonUtil.jsonReader(
        path.resolve('./chains.json'),
        async (error, objects) => {
          if (error) {
            this.logger.warn('can not read chains.json');
            return;
          }
          const chainInfos = await validateChainInfo(objects);
          await this.chainRepo.createOrUpdate(chainInfos);
        },
      );
    } catch {
      throw new Error('seeding chain failed');
    }
  }
}
