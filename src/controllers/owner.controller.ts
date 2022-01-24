import {
  Controller,
  Get,
  Post,
  Query,
  Inject,
  Body,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CONTROLLER_CONSTANTS } from 'src/common/constants/api.constant';
import { MODULE_REQUEST, SERVICE_INTERFACE } from 'src/module.config';
import { IMultisigWalletService } from 'src/services/imultisig-wallet.service';
import { GetSafesByOwnerAddressRequest } from 'src/dtos/requests/multisig-wallet/get-safe-by-owner.request';
@Controller(CONTROLLER_CONSTANTS.OWNER)
@ApiTags(CONTROLLER_CONSTANTS.OWNER)
export class OwnerController {
  constructor(
    @Inject(SERVICE_INTERFACE.IMULTISIG_WALLET_SERVICE)
    private multisigWalletService: IMultisigWalletService,
  ) { }

  @Get(':address/safes')
  @ApiOperation({
    summary: 'Return Safes where the address provided is an owner',
  })
  async getSafes(
    @Param('address') address: string,
    @Query() query: GetSafesByOwnerAddressRequest
  ) {
    return await this.multisigWalletService.getMultisigWalletsByOwner(address, query.internalChainId);
  }
}
