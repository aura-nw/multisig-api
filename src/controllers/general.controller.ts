import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from 'src/common/constants/api.constant';
import {
  MODULE_REQUEST,
  MODULE_RESPONSE,
  SERVICE_INTERFACE,
} from 'src/module.config';
import { IGeneralService } from 'src/services/igeneral.service';

@Controller(CONTROLLER_CONSTANTS.GENERAL)
@ApiTags(CONTROLLER_CONSTANTS.GENERAL)
export class GeneralController {
  constructor(
    @Inject(SERVICE_INTERFACE.IGENERAL_SERVICE)
    private generalService: IGeneralService,
  ) {}

  @Post(URL_CONSTANTS.NETWORK_LIST)
  @ApiOperation({ summary: 'Show network list' })
  @ApiOkResponse({
    status: 200,
    type: MODULE_RESPONSE.NetworkListResponse,
    description: 'Show list of networks',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async showNetworkList() {
    return this.generalService.showNetworkList();
  }

  @Get(URL_CONSTANTS.ACCOUNT_ONCHAIN)
  @ApiOperation({ summary: 'Get account onchain' })
  @ApiOkResponse({
    status: 200,
    type: MODULE_RESPONSE.GetAccountOnchainResponse,
    description: 'Show information of a multisig address',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getAccountOnchain(
    @Param() param: MODULE_REQUEST.GetAccountOnchainParam,
  ) {
    return this.generalService.getAccountOnchain(param);
  }

  @Get(URL_CONSTANTS.LIST_VALIDATORS)
  @ApiOperation({ summary: 'Get validators' })
  @ApiOkResponse({
    status: 200,
    type: MODULE_RESPONSE.GetAccountOnchainResponse,
    description: 'Get validators',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getValidators(@Param() param: MODULE_REQUEST.GetValidatorsParam) {
    return this.generalService.getValidators(param);
  }

  @Get(URL_CONSTANTS.DELEGATOR_REWARDS)
  @ApiOperation({
    summary:
      'Get Total Rewards from each delegated validator for the delegator address',
  })
  @ApiOkResponse({
    status: 200,
    type: MODULE_RESPONSE.GetDelegatorRewardsResponse,
    description: 'Get Delegator Rewards',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getDelegatorRewards(
    @Param() param: MODULE_REQUEST.GetDelegatorRewardsParam,
  ) {
    return this.generalService.getDelegatorRewards(param);
  }

  @Get(URL_CONSTANTS.DELEGATION_INFORMATION)
  @ApiOperation({
    summary:
      'DelegatorDelegations queries all delegations of a given delegator address.',
  })
  @ApiOkResponse({
    status: 200,
    type: MODULE_RESPONSE.GetDelegationInformationResponse,
    description: 'Get Delegation Information',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getDelegationInformation(
    @Param() param: MODULE_REQUEST.GetDelegationInformationParam,
    @Query() query: MODULE_REQUEST.GetDelegationInformationQuery,
  ) {
    return this.generalService.getDelegationInformation(param, query);
  }

  @Get(URL_CONSTANTS.GET_PROPOSALS)
  @ApiOkResponse({
    status: 200,
    type: MODULE_RESPONSE.GetProposalsResponse,
    description: 'Get Proposals',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getProposals(@Query() query: MODULE_REQUEST.GetProposalsQuery) {
    return this.generalService.getProposals(query);
  }

  @Get(URL_CONSTANTS.GET_PROPOSAL_DETAILS)
  @ApiOkResponse({
    status: 200,
    type: MODULE_RESPONSE.GetProposalDetailsResponse,
    description: 'Get Proposals',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getProposalDetails(
    @Param() param: MODULE_REQUEST.GetProposalDetailsParam,
  ) {
    return this.generalService.getProposalDetails(param);
  }
}
