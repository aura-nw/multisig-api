import { URL_CONSTANTS } from './../../common/constants/api.constant';
import { Controller, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CONTROLLER_CONSTANTS } from '../../common/constants/api.constant';
import { CommonGet } from '../../decorators/common.decorator';
import { DistributionService } from './distribution.service';
import {
  GetDelegationDto,
  GetDelegationResponseDto,
  GetDelegationsParamDto,
  GetDelegationsResponseDto,
  GetUndelegationsParamDto,
  GetUndelegationsResponseDto,
  GetValidatorDetailDto,
  GetValidatorsParamDto,
  GetValidatorsQueryDto,
  GetValidatorsResponseDto,
} from './dto';
import { SwaggerBaseApiResponse } from '../../common/dtos/response.dto';

@Controller(CONTROLLER_CONSTANTS.DISTRIBUTION)
@ApiTags(CONTROLLER_CONSTANTS.DISTRIBUTION)
export class DistributionController {
  constructor(private distributionService: DistributionService) {}

  @CommonGet({
    url: URL_CONSTANTS.GET_VALIDATORS,
    summary: 'Queries all validators.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(GetValidatorsResponseDto),
      description: 'List validators',
      schema: {},
    },
  })
  async getValidators(
    @Param() param: GetValidatorsParamDto,
    @Query() query: GetValidatorsQueryDto,
  ) {
    return this.distributionService.getValidators(param, query);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_VALIDATOR,
    summary: 'Queries a validator.',
    apiOkResponseOptions: {
      status: 200,
      description: 'Validator detail',
      schema: {},
    },
  })
  async getValidator(@Param() param: GetValidatorDetailDto) {
    return this.distributionService.getValidatorInfo(param);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_DELEGATIONS,
    summary: 'Queries all delegations of a user.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(GetDelegationsResponseDto),
      description: 'List delegations of a user',
      schema: {},
    },
  })
  async getDelegations(@Param() param: GetDelegationsParamDto) {
    return this.distributionService.getDelegations(param);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_DELEGATION,
    summary: 'Get single validator info and delegation from user.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(GetDelegationResponseDto),
      description: 'List delegation and validator of a user',
      schema: {},
    },
  })
  async getDelegation(@Query() query: GetDelegationDto) {
    return this.distributionService.getDelegation(query);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_UNDELEGATIONS,
    summary: 'Queries all undelegations of a user.',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(GetUndelegationsResponseDto),
      description: 'List undelegations of a user',
      schema: {},
    },
  })
  async getUndelegations(@Param() param: GetUndelegationsParamDto) {
    return this.distributionService.getUndelegations(param);
  }
}
