import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from 'src/common/constants/api.constant';
import { MODULE_REQUEST, SERVICE_INTERFACE } from 'src/module.config';
import { IMultisigWalletService } from 'src/services/imultisig-wallet.service';
@Controller(CONTROLLER_CONSTANTS.OWNER)
@ApiTags(CONTROLLER_CONSTANTS.OWNER)
export class OwnerController {
  constructor(
    @Inject(SERVICE_INTERFACE.IMULTISIG_WALLET_SERVICE)
    private multisigWalletService: IMultisigWalletService,
  ) {}

  @Get(URL_CONSTANTS.GET_SAFES_BY_OWNER)
  @ApiOperation({
    summary: 'Return Safes where the address provided is an owner',
  })
  async getSafes(@Query() query: MODULE_REQUEST.GetSafesByOwnerAddressQuery) {
    return await this.multisigWalletService.getMultisigWalletsByOwner(query);
  }
}
