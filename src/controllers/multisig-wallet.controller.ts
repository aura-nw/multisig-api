import {
  Controller,
  Get,
  Post,
  Query,
  Inject,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CONTROLLER_CONSTANTS } from 'src/common/constants/api.constant';
import { MODULE_REQUEST, SERVICE_INTERFACE } from 'src/module.config';
import { IMultisigWalletService } from 'src/services/imultisig-wallet.service';
@Controller(CONTROLLER_CONSTANTS.MULTISIG_WALLET)
@ApiTags(CONTROLLER_CONSTANTS.MULTISIG_WALLET)
export class MultisigWalletController {
  constructor(
    @Inject(SERVICE_INTERFACE.IMULTISIG_WALLET_SERVICE)
    private multisigWalletService: IMultisigWalletService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a multisig wallet' })
  async createMultisigWallet(
    @Body() request: MODULE_REQUEST.CreateMultisigWalletRequest,
  ) {
    return await this.multisigWalletService.createMultisigWallet(request);
  }

  @Get(':safeId')
  @ApiOperation({ summary: 'Get status of the multisig wallet by safeId' })
  async getMultisigWallet(@Param('safeId') safeId: string) {
    return await this.multisigWalletService.getMultisigWallet(safeId);
  }

  @Post(':safeId/confirm')
  @ApiOperation({ summary: 'Confirm multisig wallet' })
  async confirmMultisigWallet(
    @Param('safeId') safeId: string,
    @Body() request: MODULE_REQUEST.ConfirmMultisigWalletRequest,
  ) {
    return await this.multisigWalletService.confirm(safeId, request);
  }

  @Delete(':safeId')
  @ApiOperation({ summary: 'Delete pending multisig wallet' })
  async deletePendingMultisigWallet(
    @Param('safeId') safeId: string,
    // @Body() request: MODULE_REQUEST.ConfirmMultisigWalletRequest,
  ) {
    return `Delete safe ${safeId}`;
    // return await this.multisigWalletService.confirm(safeId, request);
  }

  // @Get(':address/balance')
  // @ApiOperation({ summary: 'Get balance for Aura tokens' })
  // async getBalance(@Param('address') address: string) {
  //   return `Get balance for Aura tokens of ${address}`;
  // }

  // @Get(':address/creation')
  // @ApiOperation({ summary: 'Get creation information of Safe' })
  // async getCreation(@Param('address') address: string) {
  //   return `Get creation information of ${address}`;
  // }
}
