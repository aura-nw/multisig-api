import { Inject, Logger } from '@nestjs/common';
import { ResponseDto } from '../../dtos/responses/response.dto';
import { IGeneralService } from '../igeneral.service';
import { BaseService } from './base.service';
import { CommonUtil } from '../../utils/common.util';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { IGeneralRepository } from '../../repositories/igeneral.repository';
import { ErrorMap } from '../../common/error.map';
import { IMultisigWalletRepository } from '../../repositories';
import * as axios from 'axios';
import { IGasRepository } from '../../repositories/igas.repository';
import { IndexerAPI } from 'src/utils/apis/IndexerAPI';
import { ConfigService } from 'src/shared/services/config.service';

export class GeneralService extends BaseService implements IGeneralService {
  private readonly _logger = new Logger(GeneralService.name);
  private _commonUtil: CommonUtil = new CommonUtil();
  private _indexer = new IndexerAPI(this.configService.get('INDEXER_URL'));

  constructor(
    private configService: ConfigService,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private chainRepo: IGeneralRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
    private safeRepo: IMultisigWalletRepository,
    @Inject(REPOSITORY_INTERFACE.IGAS_REPOSITORY)
    private gasRepo: IGasRepository,
  ) {
    super(chainRepo);
    this._logger.log(
      '============== Constructor General Service ==============',
    );
  }

  async getValidators(param: MODULE_REQUEST.GetValidatorsParam) {
    const { internalChainId } = param;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);
      const result = await axios.default.get(
        new URL(
          '/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED',
          chain.rest,
        ).href,
      );
      return ResponseDto.response(ErrorMap.SUCCESSFUL, result.data);
    } catch (error) {
      return ResponseDto.responseError(GeneralService.name, error);
    }
  }

  async showNetworkList(): Promise<ResponseDto> {
    try {
      const chains = await this.chainRepo.showNetworkList();
      for (const chain of chains) {
        const gas = await this.gasRepo.findByCondition(
          {
            chainId: chain.chainId,
          },
          undefined,
          ['typeUrl', 'gasAmount', 'multiplier'],
        );
        chain.defaultGas = gas;
      }
      return ResponseDto.response(ErrorMap.SUCCESSFUL, chains);
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
