import { Body, Controller, Inject, Logger, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CONTROLLER_CONSTANTS } from '../../common/constants/api.constant';
import { MODULE_REQUEST, SERVICE_INTERFACE } from '../../module.config';
import { IAuthService } from '../../services/iauth.service';

@Controller(CONTROLLER_CONSTANTS.AUTH)
@ApiTags(CONTROLLER_CONSTANTS.AUTH)
export class AuthController {
  private readonly _logger = new Logger(AuthController.name);

  constructor(
    @Inject(SERVICE_INTERFACE.IAUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Send signature to create access token',
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  async signin(@Body() request: MODULE_REQUEST.AuthRequest) {
    return this.authService.auth(request);
  }
}
