import { Controller, Query, Logger, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from '../../common/constants/api.constant';
import { CommonGet } from '../../decorators/common.decorator';
import { SwaggerBaseApiResponse } from '../../common/dtos/response.dto';
import {
  GetProposalByIdDto,
  GetProposalDepositsDto,
  GetProposalsParamDto,
  GetProposalsResponseDto,
  GetValidatorVotesByProposalIdResponseDto,
  GetValidatorVotesDto,
  GetVotesByProposalIdParamDto,
  GetVotesByProposalIdQueryDto,
  GetVotesByProposalIdResponseDto,
  ProposalDepositResponseDto,
  ProposalDetailDto,
} from './dto';
import { GovService } from './gov.service';

@Controller(CONTROLLER_CONSTANTS.GOV)
@ApiTags(CONTROLLER_CONSTANTS.GOV)
export class GovController {
  public readonly logger = new Logger(GovController.name);

  constructor(private govService: GovService) {}

  @CommonGet({
    url: URL_CONSTANTS.GET_PROPOSALS,
    summary: 'Queries all proposals.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(GetProposalsResponseDto),
      description: 'List proposals',
      schema: {},
    },
  })
  async getProposals(@Param() param: GetProposalsParamDto) {
    this.logger.log('========== Queries all proposals ==========');
    return this.govService.getProposals(param);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_PROPOSAL_BY_ID,
    summary: 'Queries a single proposal.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(ProposalDetailDto),
      description: 'Proposal Details',
      schema: {},
    },
  })
  async getProposalById(@Param() param: GetProposalByIdDto) {
    return this.govService.getProposalById(param);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_VOTES_BY_PROPOSAL_ID,
    summary: 'List votes by proposal Id.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(GetVotesByProposalIdResponseDto),
      description: 'List votes by proposal Id',
      schema: {},
    },
  })
  async getVotesByProposalId(
    @Param() param: GetVotesByProposalIdParamDto,
    @Query() query: GetVotesByProposalIdQueryDto,
  ) {
    return this.govService.getVotesByProposalId(param, query);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_VALIDATOR_VOTES_BY_PROPOSAL_ID,
    summary: 'List validator votes by proposal Id.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(GetValidatorVotesByProposalIdResponseDto),
      description: 'List validators votes by proposal Id',
      schema: {},
    },
  })
  async getValidatorVotesByProposalId(@Param() param: GetValidatorVotesDto) {
    return this.govService.getValidatorVotesByProposalId(param);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_PROPOSAL_DEPOSITS_BY_ID,
    summary: 'Queries deposit txs of a given proposal.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(ProposalDepositResponseDto),
      description: 'List proposal deposits',
      schema: {},
    },
  })
  async getProposalDepositById(@Param() param: GetProposalDepositsDto) {
    this.logger.log(
      '========== Queries deposit txs of a given proposal ==========',
    );
    return this.govService.getProposalDepositById(param);
  }
}
