import { Logger } from '@nestjs/common';
import { ResponseDto } from '../../dtos/responses/response.dto';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { ErrorMap } from '../../common/error.map';
import { IndexerClient } from '../../utils/apis/IndexerClient';
import { ConfigService } from '../../shared/services/config.service';
import { ChainRepository } from './chain.repository';
import { GasRepository } from '../gas/gas.repository';
import { plainToInstance } from 'class-transformer';
import { NetworkListResDto } from './dto/res/network-list.res';

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
      const gasInfo = await Promise.all(
        chains.map((chain) => this.gasRepo.findGasByChainId(chain.chainId)),
      );

      const result = chains.map((chain) => {
        const networkInfo = plainToInstance(NetworkListResDto, chain);
        networkInfo.defaultGas = gasInfo.find(
          (g) => g.chainId === networkInfo.chainId,
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
    param: MODULE_REQUEST.GetAccountOnchainParam,
  ): Promise<ResponseDto> {
    try {
      const { safeAddress, internalChainId } = param;

      const chainInfo = await this.chainRepo.findChain(internalChainId);
      const account = await this._indexer.getAccountNumberAndSequence(
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
