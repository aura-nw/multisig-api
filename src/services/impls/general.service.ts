import { Inject, Logger } from '@nestjs/common';
import { ResponseDto } from '../../dtos/responses/response.dto';
import { IGeneralService } from '../igeneral.service';
import { BaseService } from './base.service';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { IGeneralRepository } from '../../repositories/igeneral.repository';
import { ErrorMap } from '../../common/error.map';
import { IGasRepository } from '../../repositories/igas.repository';
import { IndexerClient } from '../../utils/apis/indexer-client.service';
import { ConfigService } from '../../shared/services/config.service';

export class GeneralService extends BaseService implements IGeneralService {
  private readonly _logger = new Logger(GeneralService.name);
  private _indexer = new IndexerClient(this.configService.get('INDEXER_URL'));

  constructor(
    private configService: ConfigService,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private chainRepo: IGeneralRepository,
    @Inject(REPOSITORY_INTERFACE.IGAS_REPOSITORY)
    private gasRepo: IGasRepository,
  ) {
    super(chainRepo);
    this._logger.log(
      '============== Constructor General Service ==============',
    );
  }

  async showNetworkList(): Promise<ResponseDto> {
    try {
      const chains = await this.chainRepo.showNetworkList();
      const result = await Promise.all(
        chains.map(async (chain) => {
          const gas = await this.gasRepo.findByCondition(
            {
              chainId: chain.chainId,
            },
            undefined,
            ['typeUrl', 'gasAmount', 'multiplier'],
          );
          chain.defaultGas = gas;
          return chain;
        }),
      );
      return ResponseDto.response(ErrorMap.SUCCESSFUL, result);
    } catch (error) {
      return ResponseDto.responseError(GeneralService.name, error);
    }
  }

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
      return ResponseDto.responseError(GeneralService.name, error);
    }
  }
}
