import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { CommonUtil } from '../../utils/common.util';
import { validateChainInfo } from '../../utils/validations/chain.validation';
import { ChainRepository } from '../chain/chain.repository';

@Injectable()
export class SeederService {
  private readonly _logger = new Logger(SeederService.name);

  private _commonUtil: CommonUtil = new CommonUtil();

  constructor(private chainRepo: ChainRepository) {}

  async seed() {
    await this.seedChain();
  }

  async seedChain() {
    try {
      this._commonUtil.jsonReader(
        path.resolve('./chains.json'),
        async (error, objects) => {
          if (error) {
            this._logger.warn('can not read chains.json');
            return;
          }
          const chainInfos = await validateChainInfo(objects);
          await this.chainRepo.createOrUpdate(chainInfos);
        },
      );
    } catch (error) {
      throw new Error('seeding chain failed');
    }
  }
}
