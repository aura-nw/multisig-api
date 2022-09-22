import { Controller, Inject, Logger, Param } from '@nestjs/common';
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
import { IDistributionService } from 'src/services/idistribution.service';
@Controller(CONTROLLER_CONSTANTS.DISTRIBUTION)
@ApiTags(CONTROLLER_CONSTANTS.DISTRIBUTION)
export class DistributionController {
  public readonly _logger = new Logger(DistributionController.name);
  constructor(
    @Inject(SERVICE_INTERFACE.IDISTRIBUTION_SERVICE)
    private distributionService: IDistributionService,
  ) {}

  @CommonGet({
    url: URL_CONSTANTS.GET_VALIDATORS,
    summary: 'Queries all validators.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(MODULE_RESPONSE.GetValidatorsResponse),
      description: 'List validators',
      schema: {},
    },
  })
  async getValidators(@Param() param: MODULE_REQUEST.GetValidatorsParam) {
    return this.distributionService.getValidators(param);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_DELEGATIONS,
    summary: 'Queries all delegations of a user.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(MODULE_RESPONSE.GetDelegationsResponse),
      description: 'List delegations of a user',
      schema: {},
    },
  })
  async getDelegations(
    @Param() param: MODULE_REQUEST.GetDelegationInformationParam,
  ) {
    return this.distributionService.getDelegations(param);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_UNDELEGATIONS,
    summary: 'Queries all undelegations of a user.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(MODULE_RESPONSE.GetUndelegationsResponse),
      description: 'List undelegations of a user',
      schema: {},
    },
  })
  async getUndelegations(@Param() param: MODULE_REQUEST.GetUndelegationsParam) {
    return this.distributionService.getUndelegations(param);
  }
}