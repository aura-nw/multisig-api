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
      const networkInfo = chains.map(async (chain) => {
        const res = plainToInstance(NetworkListResponseDto, chain);
        res.defaultGas = await this.gasRepo.findGasByChainId(chain.chainId);
        return res;
      });

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
