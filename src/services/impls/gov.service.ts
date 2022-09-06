import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import {
  MODULE_REQUEST,
  REPOSITORY_INTERFACE,
  RESPONSE_CONFIG,
} from 'src/module.config';
import { CommonUtil } from 'src/utils/common.util';
import { IGovService } from '../gov.service';
import { IGeneralRepository } from 'src/repositories';
import { Chain } from 'src/entities';
import { BaseService } from './base.service';

@Injectable()
export class GovService implements IGovService {
  private readonly _logger = new Logger(GovService.name);
  private _commonUtil: CommonUtil = new CommonUtil();
  auraChain: Chain;

  constructor(
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private chainRepo: IGeneralRepository,
  ) {
    this._logger.log(
      '============== Constructor Multisig Wallet Service ==============',
    );
  }

  async getProposals(param: MODULE_REQUEST.GetProposalsParam) {
    const { internalChainId } = param;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);
      const result = await this._commonUtil.request(
        new URL(
          '/cosmos/gov/v1beta1/proposals?pagination.limit=10&pagination.reverse=true',
          chain.rest,
        ).href,
      );
      return ResponseDto.response(ErrorMap.SUCCESSFUL, result);
    } catch (e) {
      return ResponseDto.responseError(GovService.name, e);
    }
  }
}
