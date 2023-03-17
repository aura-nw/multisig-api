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
  Param,
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
} from 'src/common/constants/api.constant';
import { SwaggerBaseApiResponse } from 'src/dtos/responses';
import {
  MODULE_REQUEST,
  MODULE_RESPONSE,
  SERVICE_INTERFACE,
} from 'src/module.config';
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
  @ApiOkResponse({
    status: 200,
    type: SwaggerBaseApiResponse(MODULE_RESPONSE.CreateSafeResponse),
    description: 'Safe information',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async createMultisigWallet(
    @Body() request: MODULE_REQUEST.CreateMultisigWalletRequest,
  ) {
    this._logger.log('========== Create a multisig wallet ==========');
    return this.multisigWalletService.createMultisigWallet(request);
  }

  @Get(URL_CONSTANTS.GET_SAFE)
  @ApiOperation({ summary: 'Get status of the multisig wallet by safeId' })
  @ApiOkResponse({
    status: 200,
    type: SwaggerBaseApiResponse(MODULE_RESPONSE.GetMultisigWalletResponse),
    description: 'Status of multisig wallet',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getMultisigWallet(
    @Param() param: MODULE_REQUEST.GetSafePathParams,
    @Query() query: MODULE_REQUEST.GetSafeQuery,
  ) {
    this._logger.log(
      '========== Get status of the multisig wallet by safeId ==========',
    );
    return this.multisigWalletService.getMultisigWallet(param, query);
  }

  @Get(URL_CONSTANTS.GET_SAFE_BALANCE)
  @ApiOperation({ summary: 'Get balance of the multisig wallet by safeId' })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getBalance(
    @Param() param: MODULE_REQUEST.GetSafeBalancePathParams,
    @Query() query: MODULE_REQUEST.GetSafeBalanceQuery,
  ) {
    this._logger.log(
      '========== Get status of the multisig wallet by safeId ==========',
    );
    return this.multisigWalletService.getBalance(param, query);
  }

  @Post(URL_CONSTANTS.CONFIRM_SAFE)
  @ApiOperation({ summary: 'Confirm multisig wallet' })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async confirmMultisigWallet(
    @Param() param: MODULE_REQUEST.ConfirmSafePathParams,
    @Body() request: MODULE_REQUEST.ConfirmMultisigWalletRequest,
  ) {
    this._logger.log('========== Confirm multisig wallet ==========');
    return this.multisigWalletService.confirm(param, request);
  }

  @Delete(URL_CONSTANTS.DELETE_SAFE)
  @ApiOperation({ summary: 'Delete pending multisig wallet' })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async deletePendingMultisigWallet(
    @Param() param: MODULE_REQUEST.DeleteSafePathParams,
    @Body() request: MODULE_REQUEST.DeleteMultisigWalletRequest,
  ) {
    this._logger.log('========== Delete pending multisig wallet ==========');
    return this.multisigWalletService.deletePending(param, request);
  }
}
