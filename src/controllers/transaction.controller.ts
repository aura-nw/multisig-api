import {
  Controller,
  Get,
  Post,
  Query,
  Inject,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from 'src/common/constants/api.constant';
import { MODULE_REQUEST, SERVICE_INTERFACE } from 'src/module.config';
import { ISimulatingService } from 'src/services/isimulating.service';
import { ITransactionService } from 'src/services/transaction.service';

@Controller(CONTROLLER_CONSTANTS.TRANSACTION)
@ApiTags(CONTROLLER_CONSTANTS.TRANSACTION)
export class TransactionController {
  public readonly _logger = new Logger(TransactionController.name);

  constructor(
    @Inject(SERVICE_INTERFACE.ITRANSACTION_SERVICE)
    private transactionService: ITransactionService,
  ) {}

  @Post(URL_CONSTANTS.CREATE)
  @ApiOperation({ summary: 'Create multisig transaction' })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async createTransaction(@Body() request: MODULE_REQUEST.CreateTransactionRequest) {
    this._logger.log('========== Create multisig transaction ==========');
    return await this.transactionService.createTransaction(request);
  }

  @Post(URL_CONSTANTS.SIGLE_SIGN)
  @ApiOperation({ summary: 'owner sign to their transaction' })
  async signTransaction(
    @Body() request: MODULE_REQUEST.SingleSignTransactionRequest,
  ) {
    return await this.transactionService.singleSignTransaction(request);
  }

  @Post(`multisig/:internalTxHash/${URL_CONSTANTS.broadcasting}`)
  @ApiOperation({ summary: 'owner broadcast their transaction' })
  async broadcastTransaction(
    @Body() request: MODULE_REQUEST.BroadcastTransactionRequest,
  ) {
    return await this.transactionService.broadcastTransaction(request);
  }

  @Get()
  @ApiOperation({
    summary: 'Returns a paginated list of transactions for a Safe',
  })
  async getAllTxs() {
    return `Returns a paginated list of transactions for a Safe`;
  }

  @Get('queue')
  @ApiOperation({ summary: 'Returns queue txs for a Safe' })
  async getIncomingTransfers() {
    return `Returns incoming tokens transfers for a Safe`;
  }

  @Get('multisig')
  @ApiOperation({ summary: 'Returns the history of a multisig tx' })
  async getMultisigTxs() {
    return `Returns the history of a multisig tx for a Safe`;
  }

  @Get('multisig/:internalTxHash')
  @ApiOperation({ summary: 'Get detail of a multisig tx by internal tx hash' })
  async getMultisigTx(@Param('internalTxHash') internalTxHash: string) {
    return `Get detail of a multisig tx by internal tx hash`;
  }

  @Get('multisig/:internalTxHash/signatures')
  @ApiOperation({
    summary: 'Get the list of signatures for a multisig transaction',
  })
  async getSignsOfMultisigTx(@Param('internalTxHash') internalTxHash: string) {
    // return `Get the list of signatures for a multisig transaction`;
    return await this.transactionService.getListConfirmMultisigTransaction(internalTxHash);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Returns aura tokens transfers for a Safe' })
  async getTokenTransferTxs() {
    return `Returns aura tokens transfers for a Safe`;
  }

  @Post(URL_CONSTANTS.SEND)
  @ApiOperation({ summary: 'Send transaction to AURA' })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async sendTransaction(@Body() request: MODULE_REQUEST.SendTransactionRequest) {
    this._logger.log('========== Send transaction to AURA ==========');
      return await this.transactionService.sendTransaction(request);
  }
}
