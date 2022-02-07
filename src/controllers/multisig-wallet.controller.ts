import {
  Controller,
  Get,
  Post,
  Query,
  Inject,
  Body,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CONTROLLER_CONSTANTS, URL_CONSTANTS } from 'src/common/constants/api.constant';
import { OptionalInternalChainId } from 'src/dtos/requests/multisig-wallet/optional-internal-chainid.request';
import { MODULE_REQUEST, SERVICE_INTERFACE } from 'src/module.config';
import { IMultisigWalletService } from 'src/services/imultisig-wallet.service';
@Controller(CONTROLLER_CONSTANTS.MULTISIG_WALLET)
@ApiTags(CONTROLLER_CONSTANTS.MULTISIG_WALLET)
export class MultisigWalletController {
  public readonly _logger = new Logger(MultisigWalletController.name);

  constructor(
    @Inject(SERVICE_INTERFACE.IMULTISIG_WALLET_SERVICE)
    private multisigWalletService: IMultisigWalletService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a multisig wallet' })
  async createMultisigWallet(
    @Body() request: MODULE_REQUEST.CreateMultisigWalletRequest,
  ) {
    return await this.multisigWalletService.createMultisigWallet(request);
  }

  @Get(':safeId')
  @ApiOperation({ summary: 'Get status of the multisig wallet by safeId' })
  async getMultisigWallet(
    @Param('safeId') safeId: string,
    @Query() query: OptionalInternalChainId
  ) {
    return await this.multisigWalletService.getMultisigWallet(safeId, query.internalChainId);
  }

  @Post(':safeId')
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
    @Body() request: MODULE_REQUEST.DeleteMultisigWalletRequest,
  ) {
    return await this.multisigWalletService.deletePending(safeId, request);
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

  // @Post()
  // @ApiOperation({ summary: 'Connect multisig wallet' })
  // @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  // @HttpCode(HttpStatus.OK)
  // async createIAO(@Body() request: MODULE_REQUEST.ConnectMultisigWalletRequest) {
  //   this._logger.log('========== Connect multisig wallet ==========');
  //   return await this.multisigWalletService.connectMultisigWalletByAddress(request);
  // }


}
