import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CONTROLLER_CONSTANTS } from '../../common/constants/api.constant';
import { AuthService } from './auth.service';
import { RequestAuthDto } from './dto/request-auth.dto';

@Controller(CONTROLLER_CONSTANTS.AUTH)
@ApiTags(CONTROLLER_CONSTANTS.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({
    summary: 'Send signature to create access token',
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  async signIn(@Body() request: RequestAuthDto) {
    return this.authService.auth(request);
  }
}
