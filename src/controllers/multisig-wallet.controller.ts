import { Controller, Query, Inject, Body, Logger, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from 'src/common/constants/api.constant';
import {
  CommonDelete,
  CommonGet,
  CommonPost,
} from 'src/decorators/common.decorator';
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

  @CommonPost({ summary: 'Create a multisig wallet' })
  @ApiOkResponse({
    status: 200,
    type: SwaggerBaseApiResponse(MODULE_RESPONSE.CreateSafeResponse),
    description: 'Safe information',
    schema: {},
  })
  async createMultisigWallet(
    @Body() request: MODULE_REQUEST.CreateMultisigWalletRequest,
  ) {
    this._logger.log('========== Create a multisig wallet ==========');
    return this.multisigWalletService.createMultisigWallet(request);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_SAFE,
    summary: 'Get status of the multisig wallet by safeId',
  })
  @ApiOkResponse({
    status: 200,
    type: SwaggerBaseApiResponse(MODULE_RESPONSE.GetMultisigWalletResponse),
    description: 'Status of multisig wallet',
    schema: {},
  })
  async getMultisigWallet(
    @Param() param: MODULE_REQUEST.GetSafePathParams,
    @Query() query: MODULE_REQUEST.GetSafeQuery,
  ) {
    this._logger.log(
      '========== Get status of the multisig wallet by safeId ==========',
    );
    return this.multisigWalletService.getMultisigWallet(param, query);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_SAFE_BALANCE,
    summary: 'Get balance of the multisig wallet by safeId',
  })
  @ApiOkResponse({
    status: 200,
    type: SwaggerBaseApiResponse(MODULE_RESPONSE.GetSafeBalanceResponse),
    description: 'Status of multisig wallet',
    schema: {},
  })
  async getBalance(
    @Param() param: MODULE_REQUEST.GetSafeBalancePathParams,
    @Query() query: MODULE_REQUEST.GetSafeBalanceQuery,
  ) {
    this._logger.log(
      '========== Get status of the multisig wallet by safeId ==========',
    );
    return this.multisigWalletService.getBalance(param, query);
  }

  @CommonPost({
    url: URL_CONSTANTS.CONFIRM_SAFE,
    summary: 'Confirm multisig wallet',
  })
  async confirmMultisigWallet(
    @Param() param: MODULE_REQUEST.ConfirmSafePathParams,
    @Body() request: MODULE_REQUEST.ConfirmMultisigWalletRequest,
  ) {
    this._logger.log('========== Confirm multisig wallet ==========');
    return this.multisigWalletService.confirm(param, request);
  }

  @CommonDelete({
    url: URL_CONSTANTS.DELETE_SAFE,
    summary: 'Delete pending multisig wallet',
  })
  async deletePendingMultisigWallet(
    @Param() param: MODULE_REQUEST.DeleteSafePathParams,
    @Body() request: MODULE_REQUEST.DeleteMultisigWalletRequest,
  ) {
    this._logger.log('========== Delete pending multisig wallet ==========');
    return this.multisigWalletService.deletePending(param, request);
  }
}
