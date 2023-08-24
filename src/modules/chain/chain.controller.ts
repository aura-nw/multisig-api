import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from '../../common/constants/api.constant';
import { ChainService } from './chain.service';
import { ChainDto } from './dto';

@Controller(CONTROLLER_CONSTANTS.GENERAL)
@ApiTags(CONTROLLER_CONSTANTS.GENERAL)
export class ChainController {
  constructor(private chainService: ChainService) {}

  @Post(URL_CONSTANTS.NETWORK_LIST)
  @ApiOperation({ summary: 'Show network list' })
  @ApiOkResponse({
    status: 200,
    type: ChainDto,
    description: 'Show list of networks',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async showNetworkList() {
    return this.chainService.showNetworkList();
  }
}
