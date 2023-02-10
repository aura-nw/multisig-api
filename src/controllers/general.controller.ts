import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
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
} from '../common/constants/api.constant';
import {
  MODULE_REQUEST,
  MODULE_RESPONSE,
  SERVICE_INTERFACE,
} from '../module.config';
import { IGeneralService } from '../services/igeneral.service';

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
  async getAccountOnchain(
    @Param() param: MODULE_REQUEST.GetAccountOnchainParam,
  ) {
    return this.generalService.getAccountOnchain(param);
  }
}
