import { Controller, Query, Inject, Logger, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from '../../common/constants/api.constant';
import { CommonGet } from '../../decorators/common.decorator';
import { SwaggerBaseApiResponse } from '../../dtos/responses';
import {
  MODULE_REQUEST,
  MODULE_RESPONSE,
  SERVICE_INTERFACE,
} from '../../module.config';
import { IGovService } from '../../services/igov.service';
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
      type: SwaggerBaseApiResponse(MODULE_RESPONSE.GetProposalsResponse),
      description: 'List proposals',
      schema: {},
    },
  })
  async getProposals(@Param() param: MODULE_REQUEST.GetProposalsParam) {
    this._logger.log('========== Queries all proposals ==========');
    return this.govService.getProposals(param);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_PROPOSAL_BY_ID,
    summary: 'Queries a single proposal.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(MODULE_RESPONSE.GetProposalResponse),
      description: 'Proposal Details',
      schema: {},
    },
  })
  async getProposalById(@Param() param: MODULE_REQUEST.GetProposalParam) {
    return this.govService.getProposalById(param);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_VOTES_BY_PROPOSAL_ID,
    summary: 'List votes by proposal Id.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(
        MODULE_RESPONSE.GetVotesByProposalIdResponse,
      ),
      description: 'List votes by proposal Id',
      schema: {},
    },
  })
  async getVotesByProposalId(
    @Param() param: MODULE_REQUEST.GetVotesByProposalIdParams,
    @Query() query: MODULE_REQUEST.GetVotesByProposalIdQuery,
  ) {
    return this.govService.getVotesByProposalId(param, query);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_VALIDATOR_VOTES_BY_PROPOSAL_ID,
    summary: 'List validator votes by proposal Id.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(
        MODULE_RESPONSE.GetValidatorVotesByProposalIdResponse,
      ),
      description: 'List validators votes by proposal Id',
      schema: {},
    },
  })
  async getValidatorVotesByProposalId(
    @Param() param: MODULE_REQUEST.GetValidatorVotesByProposalIdParams,
  ) {
    return this.govService.getValidatorVotesByProposalId(param);
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
  async getProposalDepositById(
    @Param() param: MODULE_REQUEST.GetProposalDepositsByIdPathParams,
  ) {
    this._logger.log(
      '========== Queries deposit txs of a given proposal ==========',
    );
    return this.govService.getProposalDepositById(param);
  }
}
