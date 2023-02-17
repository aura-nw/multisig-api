import { Controller, Logger, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from '../../common/constants/api.constant';
import { CommonGet } from '../../decorators/common.decorator';
import {
  ResponseDto,
  SwaggerBaseApiResponse,
} from '../../common/dtos/response.dto';
import { GetUserPathParamDto } from './dto/request/get-user.req';
import { UserService } from './user.service';
@Controller(CONTROLLER_CONSTANTS.USER)
@ApiTags(CONTROLLER_CONSTANTS.USER)
export class UserController {
  public readonly _logger = new Logger(UserController.name);

  constructor(private userService: UserService) {}

  @CommonGet({
    url: URL_CONSTANTS.GET_USER_BY_ADDRESS,
    summary: 'Get user by address',
    apiOkResponseOptions: {
      status: 200,
      type: SwaggerBaseApiResponse(ResponseDto),
      description: 'User detail',
      schema: {},
    },
  })
  async getUserByAddress(@Param() param: GetUserPathParamDto) {
    this._logger.log('========== Get user by address ==========');
    return this.userService.getUserByAddress(param);
  }
}
