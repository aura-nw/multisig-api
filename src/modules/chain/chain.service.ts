import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { ChainRepository } from './chain.repository';
import { GasRepository } from '../gas/gas.repository';
import { GetAccountOnchainParamDto, NetworkListResponseDto } from './dto';
import { IndexerClient } from '../../shared/services/indexer.service';

@Injectable()
export class ChainService {
  private readonly _logger = new Logger(ChainService.name);

  constructor(
    private chainRepo: ChainRepository,
    private gasRepo: GasRepository,
    private indexer: IndexerClient,
  ) {
    this._logger.log('============== Constructor Chain Service ==============');
  }

  /**
   * showNetworkList
   * @returns
   */
  async showNetworkList(): Promise<ResponseDto> {
    try {
      const chains = await this.chainRepo.showNetworkList();
      const networkInfo = await Promise.all(
        chains.map(async (chain) => {
          const res = plainToInstance(NetworkListResponseDto, chain, {
            excludeExtraneousValues: true,
          });
          res.defaultGas = await this.gasRepo.findGasByChainId(chain.chainId);
          return res;
        }),
      );

      return ResponseDto.response(ErrorMap.SUCCESSFUL, networkInfo);
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
  ): Promise<ResponseDto> {
    try {
      const { safeAddress, internalChainId } = param;

      const chainInfo = await this.chainRepo.findChain(internalChainId);
      const account = await this.indexer.getAccountNumberAndSequence(
        chainInfo.chainId,
        safeAddress,
      );

      return ResponseDto.response(ErrorMap.SUCCESSFUL, account);
    } catch (error) {
      return ResponseDto.responseError(ChainService.name, error);
    }
  }
}
