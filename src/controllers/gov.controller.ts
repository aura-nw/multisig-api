import { Controller, Query, Inject, Body, Logger, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from 'src/common/constants/api.constant';
import { CommonGet } from 'src/decorators/common.decorator';
import { SwaggerBaseApiResponse } from 'src/dtos/responses';
import {
  MODULE_REQUEST,
  MODULE_RESPONSE,
  SERVICE_INTERFACE,
} from 'src/module.config';
import { IGovService } from 'src/services/igov.service';
@Controller(CONTROLLER_CONSTANTS.GOV)
@ApiTags(CONTROLLER_CONSTANTS.GOV)
export class GovController {
  public readonly _logger = new Logger(GovController.name);

  constructor(
    @Inject(SERVICE_INTERFACE.IGOV_SERVICE)
    private govService: IGovService,
  ) {}

  @CommonGet({
    url: URL_CONSTANTS.GET_PROPOSALS,
    summary: 'Queries all proposals.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(MODULE_RESPONSE.GetMultisigWalletResponse),
      description: 'List proposals',
      schema: {},
    },
  })
  async getProposals(@Param() param: MODULE_REQUEST.GetProposalsParam) {
    this._logger.log('========== Queries all proposals ==========');
    return this.govService.getProposals(param);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_PROPOSAL_DEPOSITS_BY_ID,
    summary: 'Queries deposit txs of a given proposal.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(MODULE_RESPONSE.GetMultisigWalletResponse),
      description: 'List proposal deposits',
      schema: {},
    },
  })
  async getProposalValidatorVotesById(
    @Param() param: MODULE_REQUEST.GetProposalDepositsByIdPathParams,
  ) {
    this._logger.log(
      '========== Queries deposit txs of a given proposal ==========',
    );
    return this.govService.getProposalDepositById(param);
  }
}
