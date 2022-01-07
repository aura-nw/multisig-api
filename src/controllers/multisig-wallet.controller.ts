import { Controller, Get, Post, Inject, Body, Param, Logger} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CONTROLLER_CONSTANTS, URL_CONSTANTS } from 'src/common/constants/api.constant';
import { MODULE_REQUEST, SERVICE_INTERFACE } from 'src/module.config';
import { IMultisigWalletService } from 'src/services/imultisig-wallet.service';
@Controller(CONTROLLER_CONSTANTS.MULTISIG_WALLET)
@ApiTags(CONTROLLER_CONSTANTS.MULTISIG_WALLET)
export class MultisigWalletController {
  public readonly _logger = new Logger(MultisigWalletController.name);

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

  @Get(':address')
  @ApiOperation({ summary: 'Get status of the multisig wallet' })
  async getMultisigWallet(@Param('address') address: string) {
    return await this.multisigWalletService.getMultisigWallet(address);
  }

  @Get(':address/balance')
  @ApiOperation({ summary: 'Get balance for Aura tokens' })
  async getBalance(@Param('address') address: string) {
    return `Get balance for Aura tokens of ${address}`;
  }

  @Get(':address/creation')
  @ApiOperation({ summary: 'Get creation information of Safe' })
  async getCreation(@Param('address') address: string) {
    return `Get creation information of ${address}`;
  }

  @Post(URL_CONSTANTS.CONNECT_WALLET)
  @ApiOperation({ summary: 'Connect wallet then get information of Safe' })
  async connectWallet(@Body() request: MODULE_REQUEST.ConnectMultisigWalletRequest) {
    this._logger.log('========== Update asset ==========');
    return await this.multisigWalletService.connectMultisigWalletByAddress(request);
  }
}
