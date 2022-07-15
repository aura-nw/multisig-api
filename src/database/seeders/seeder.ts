import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from 'src/shared/services/config.service';
import { ChainSeederService } from './chain/chain-seeder.service';

@Injectable()
export class SeederService {
  private readonly _logger = new Logger(SeederService.name);
  constructor(
    private chainSeederService: ChainSeederService,
    private configService: ConfigService,
  ) {}

  async seed() {
    const result = await this.seedChain();
  }

  async seedChain() {
    try {
      const chainInfoJson = this.configService.get(`CHAIN_INFOS`);
      const helloworld = this.configService.get(`PREFIX_NETWORK`);
      const chainInfos = JSON.parse(chainInfoJson);
      const result = await this.chainSeederService.createOrUpdate(chainInfos);
      this._logger.debug(JSON.stringify(result));
      return result;
    } catch (error) {
      throw new Error('seeding chain failed');
    }
  }
}
