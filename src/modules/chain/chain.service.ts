import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { IndexerClient } from '../../utils/apis/indexer-client.service';
import { ConfigService } from '../../shared/services/config.service';
import { ChainRepository } from './chain.repository';
import { GasRepository } from '../gas/gas.repository';
import { GetAccountOnchainParamDto, NetworkListResponseDto } from './dto';

@Injectable()
export class ChainService {
  private readonly _logger = new Logger(ChainService.name);
  private _indexer = new IndexerClient(this.configService.get('INDEXER_URL'));

  constructor(
    private configService: ConfigService,
    private chainRepo: ChainRepository,
    private gasRepo: GasRepository,
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
      const listGas = await this.gasRepo.findGasByChainIds(
        chains.map((chain) => chain.chainId),
      );

      const result = chains.map((chain) => {
        const networkInfo = plainToInstance(NetworkListResponseDto, chain);
        networkInfo.defaultGas = listGas.find(
          (g) => g !== null && g.chainId === networkInfo.chainId,
        );
        return networkInfo;
      });

      return ResponseDto.response(ErrorMap.SUCCESSFUL, result);
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
      const indexer = new IndexerClient(this.configService.get('INDEXER_URL'));

      const chainInfo = await this.chainRepo.findChain(internalChainId);
      const account = await indexer.getAccountNumberAndSequence(
        chainInfo.chainId,
        safeAddress,
      );

      return ResponseDto.response(ErrorMap.SUCCESSFUL, {
        accountNumber: account.accountNumber,
        sequence: account.sequence,
      });
    } catch (error) {
      return ResponseDto.responseError(ChainService.name, error);
    }
  }
}
