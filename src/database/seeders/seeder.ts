import { Injectable, Logger } from '@nestjs/common';
import { CommonUtil } from 'src/utils/common.util';
import { validateChainInfo } from 'src/utils/validations/chain.validation';
import { ChainSeederService } from './chain/chain-seeder.service';
import * as path from 'path';

@Injectable()
export class SeederService {
  private readonly _logger = new Logger(SeederService.name);
  private _commonUtil: CommonUtil = new CommonUtil();
  constructor(private chainSeederService: ChainSeederService) {}

  async seed() {
    await this.seedChain();
  }

  async seedChain() {
    try {
      this._commonUtil.jsonReader(path.resolve('/usr/src/app/chains.json'), async (error, objects) => {
        if (error) {
          this._logger.warn(`can not read chains.json`);
          return;
        }
        const chainInfos = await validateChainInfo(objects);
        await this.chainSeederService.createOrUpdate(chainInfos);
      });
    } catch (error) {
      throw new Error('seeding chain failed');
    }
  }
}
