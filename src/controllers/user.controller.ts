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
import { IUserService } from 'src/services/iuser.service';
@Controller(CONTROLLER_CONSTANTS.USER)
@ApiTags(CONTROLLER_CONSTANTS.USER)
export class UserController {
  public readonly _logger = new Logger(UserController.name);

  constructor(
    @Inject(SERVICE_INTERFACE.IUSER_SERVICE)
    private userService: IUserService,
  ) {}

  @CommonGet({
    url: URL_CONSTANTS.GET_USER_BY_ADDRESS,
    summary: 'Get user by address',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(MODULE_RESPONSE.ResponseDto),
      description: 'User detail',
      schema: {},
    },
  })
  async getUserByAddress(@Param() param: MODULE_REQUEST.GetUserPathParams) {
    this._logger.log('========== Get user by address ==========');
    return this.userService.getUserByAddress(param);
  }
}
