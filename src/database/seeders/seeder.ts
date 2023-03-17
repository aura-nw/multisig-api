import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from 'src/shared/services/config.service';
import { CommonUtil } from 'src/utils/common.util';
import { validateChainInfo } from 'src/utils/validations/chain.validation';
import { ChainSeederService } from './chain/chain-seeder.service';

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
      this._commonUtil.jsonReader('./chains.json', async (error, objects) => {
        if (error) {
          throw new Error(error);
        }
        const chainInfos = await validateChainInfo(objects);
        await this.chainSeederService.createOrUpdate(chainInfos);
      });
    } catch (error) {
      throw new Error('seeding chain failed');
    }
  }
}
