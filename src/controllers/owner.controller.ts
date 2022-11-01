import {
  Controller,
  Get,
  Query,
  Inject,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from '../common/constants/api.constant';
import { MODULE_REQUEST, SERVICE_INTERFACE } from '../module.config';
import { IMultisigWalletService } from '../services/imultisig-wallet.service';
@Controller(CONTROLLER_CONSTANTS.OWNER)
@ApiTags(CONTROLLER_CONSTANTS.OWNER)
export class OwnerController {
  public readonly _logger = new Logger(OwnerController.name);
  constructor(
    @Inject(SERVICE_INTERFACE.IMULTISIG_WALLET_SERVICE)
    private multisigWalletService: IMultisigWalletService,
  ) {}

  @Get(URL_CONSTANTS.GET_SAFES_BY_OWNER)
  @ApiOperation({
    summary: 'Return Safes where the address provided is an owner',
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getSafes(
    @Param() param: MODULE_REQUEST.GetSafesByOwnerAddressParams,
    @Query() query: MODULE_REQUEST.GetSafesByOwnerAddressQuery,
  ) {
    this._logger.log(
      '========== Return Safes where the address provided is an owner ==========',
    );
    return this.multisigWalletService.getMultisigWalletsByOwner(param, query);
  }
}
