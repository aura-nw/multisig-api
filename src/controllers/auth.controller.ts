import {
  Controller,
  Inject,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Body,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from 'src/common/constants/api.constant';
import { MODULE_REQUEST, SERVICE_INTERFACE } from 'src/module.config';
import { IAuthService } from 'src/services/iauth.service';

@Controller(CONTROLLER_CONSTANTS.AUTH)
@ApiTags(CONTROLLER_CONSTANTS.AUTH)
export class AuthController {
  public readonly _logger = new Logger(AuthController.name);
  constructor(
    @Inject(SERVICE_INTERFACE.IAUTH_SERVICE)
    private authService: IAuthService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Send signature to create access token',
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async signin(@Body() request: MODULE_REQUEST.AuthRequest) {
    return this.authService.auth(request);
  }
}
