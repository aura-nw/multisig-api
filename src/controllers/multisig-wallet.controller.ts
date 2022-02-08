import {
  Controller,
  Get,
  Post,
  Query,
  Inject,
  Body,
  Delete,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from 'src/common/constants/api.constant';
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
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async createMultisigWallet(
    @Body() request: MODULE_REQUEST.CreateMultisigWalletRequest,
  ) {
    this._logger.log('========== Create a multisig wallet ==========');
    return await this.multisigWalletService.createMultisigWallet(request);
  }

  @Get(URL_CONSTANTS.GET_SAFE)
  @ApiOperation({ summary: 'Get status of the multisig wallet by safeId' })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getMultisigWallet(@Query() query: MODULE_REQUEST.GetSafeQuery) {
    this._logger.log(
      '========== Get status of the multisig wallet by safeId ==========',
    );
    return await this.multisigWalletService.getMultisigWallet(query);
  }

  @Post(URL_CONSTANTS.CONFIRM_SAFE)
  @ApiOperation({ summary: 'Confirm multisig wallet' })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async confirmMultisigWallet(
    @Query() query: MODULE_REQUEST.ConfirmSafeQuery,
    @Body() request: MODULE_REQUEST.ConfirmMultisigWalletRequest,
  ) {
    this._logger.log('========== Confirm multisig wallet ==========');
    return await this.multisigWalletService.confirm(query, request);
  }

  @Delete(URL_CONSTANTS.DELETE_SAFE)
  @ApiOperation({ summary: 'Delete pending multisig wallet' })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async deletePendingMultisigWallet(
    @Query() query: MODULE_REQUEST.DeleteSafeQuery,
    @Body() request: MODULE_REQUEST.DeleteMultisigWalletRequest,
  ) {
    this._logger.log('========== Delete pending multisig wallet ==========');
    return await this.multisigWalletService.deletePending(query, request);
  }

  // @Post()
  // @ApiOperation({ summary: 'Connect multisig wallet' })
  // @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  // @HttpCode(HttpStatus.OK)
  // async createIAO(@Body() request: MODULE_REQUEST.ConnectMultisigWalletRequest) {
  //   this._logger.log('========== Connect multisig wallet ==========');
  //   return await this.multisigWalletService.connectMultisigWalletByAddress(request);
  // }
}
