import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { ChainRepository } from './chain.repository';
import { GasRepository } from '../gas/gas.repository';
import {
  ChainDto,
  GetAccountOnchainParamDto,
  NetworkListResponseDto,
} from './dto';
import { IndexerClient } from '../../shared/services/indexer.service';
import { AccountInfo } from '../../common/dtos/account-info';
import { CommonService } from '../../shared/services';

@Injectable()
export class ChainService {
  private readonly logger = new Logger(ChainService.name);

  constructor(
    private chainRepo: ChainRepository,
    private gasRepo: GasRepository,
    private indexer: IndexerClient,
    private commonSvc: CommonService,
  ) {
    this.logger.log('============== Constructor Chain Service ==============');
  }

  /**
   * showNetworkList
   * @returns
   */
  async showNetworkList(): Promise<ResponseDto<NetworkListResponseDto>> {
    try {
      const chainsInDb = await this.chainRepo.showNetworkList();

      const chains = plainToInstance(ChainDto, chainsInDb, {
        excludeExtraneousValues: true,
      });

      const { tokens } = await this.commonSvc.readConfigurationFile();

      return ResponseDto.response(ErrorMap.SUCCESSFUL, {
        chains,
        tokens,
      });
    } catch (error) {
      return ResponseDto.responseError(ChainService.name, error);
    }
  }

  /**
   * getAccountOnchain
   * @param param
   * @returns
   */
  async getAccountOnchain(
    param: GetAccountOnchainParamDto,
  ): Promise<ResponseDto<AccountInfo>> {
    try {
      const { safeAddress, internalChainId } = param;

      const chainInfo = await this.chainRepo.findChain(internalChainId);
      const account = await this.indexer.getAccount(
        chainInfo.chainId,
        safeAddress,
      );

      return ResponseDto.response(ErrorMap.SUCCESSFUL, account);
    } catch (error) {
      return ResponseDto.responseError(ChainService.name, error);
    }
  }
}
