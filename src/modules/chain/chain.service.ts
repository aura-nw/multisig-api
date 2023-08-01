import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import _ from 'lodash';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { ChainRepository } from './chain.repository';
import { ChainDto } from './dto';
import { CommonService } from '../../shared/services';
import { Chain } from './entities/chain.entity';

@Injectable()
export class ChainService {
  private readonly logger = new Logger(ChainService.name);

  constructor(
    private chainRepo: ChainRepository,
    private commonSvc: CommonService,
  ) {
    this.logger.log('============== Constructor Chain Service ==============');
  }

  /**
   * showNetworkList
   * @returns
   */
  async showNetworkList(): Promise<ResponseDto<ChainDto[]>> {
    try {
      const chainsInDb = await this.chainRepo.showNetworkList();

      const config = await this.commonSvc.readConfigurationFile();

      const chains = plainToInstance(
        ChainDto,
        chainsInDb.map((c: Chain) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          _.defaultsDeep(c, _.find(config, { chainId: c.chainId })),
        ),
        {
          excludeExtraneousValues: true,
        },
      );

      return ResponseDto.response(ErrorMap.SUCCESSFUL, chains);
    } catch (error) {
      return ResponseDto.responseError(ChainService.name, error);
    }
  }
}
