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
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from 'src/common/constants/api.constant';
import { MODULE_REQUEST, MODULE_RESPONSE, SERVICE_INTERFACE } from 'src/module.config';
import { ITransactionService } from 'src/services/transaction.service';

@Controller(CONTROLLER_CONSTANTS.TRANSACTION)
@ApiTags(CONTROLLER_CONSTANTS.TRANSACTION)
export class TransactionController {
  public readonly _logger = new Logger(TransactionController.name);

  constructor(
    @Inject(SERVICE_INTERFACE.ITRANSACTION_SERVICE)
    private transactionService: ITransactionService,
  ) { }

  @Post(URL_CONSTANTS.CREATE)
  @ApiOperation({ summary: 'API Create multisig transaction',
                  description: `It is used to allow owner of safe create transaction transfer native coin with another address. 
                  Firs of all, owner must sign transaction via wallet extension then get signature and bodyBytes, what is result of action sign. Then call API to create transaction.`})
  @ApiOkResponse({ status: 200, type: MODULE_RESPONSE.ResponseDto, description: 'The result returned is the ResponseDto class', schema: {} })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async createTransaction(
    @Body() request: MODULE_REQUEST.CreateTransactionRequest,
  ) {
    this._logger.log('========== Create multisig transaction ==========');
    return this.transactionService.createTransaction(request);
  }

  @Post(URL_CONSTANTS.CONFIRM_TRANSACTION)
  @ApiOperation({ summary: 'API Owner confirm their transaction. ',
                  description: `It is used to owner of safe sign transaction. When transaction meet threshold, it changes to status AWAITING_EXECUTION ready to broadcast to network.` })
  @ApiOkResponse({ status: 200, type: MODULE_RESPONSE.ResponseDto, description: 'The result returned is the ResponseDto class', schema: {} })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async confirmTransaction(
    @Body() request: MODULE_REQUEST.ConfirmTransactionRequest,
  ) {
    return this.transactionService.confirmTransaction(request);
  }

  @Post(URL_CONSTANTS.REJECT_TRANSACTION)
  @ApiOperation({ summary: 'Owner reject their transaction',
                  description: `It is used to owner of safe reject transaction.` })
  @ApiOkResponse({ status: 200, type: MODULE_RESPONSE.ResponseDto, description: 'The result returned is the ResponseDto class', schema: {} })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async rejectTransaction(
    @Body() request: MODULE_REQUEST.RejectTransactionParam,
  ) {
    return this.transactionService.rejectTransaction(request);
  }

  @Post(URL_CONSTANTS.GET_ALL_TXS)
  @ApiOperation({
    summary: 'Returns a paginated list of transactions for a Safe',
  })
  async getAllTxs(
    @Body() request: MODULE_REQUEST.GetAllTransactionsRequest,
  ) {
    this._logger.log('========== Get All Transactions ==========');
    return this.transactionService.getTransactionHistory(request);
  }

  @Get(URL_CONSTANTS.SIGNATURES)
  @ApiOperation({
    summary: 'Get the list of signatures for a multisig transaction',
  })
  @ApiOkResponse({ status: 200, type: MODULE_RESPONSE.MultisigSignatureRespone, description: 'List signature of multisig', schema: {} })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getSignaturesOfMultisigTx(
    @Param() param: MODULE_REQUEST.GetMultisigSignaturesParam
  ) {
    this._logger.log('========== Get Signatures of Multisig Transaction ==========');
    return this.transactionService.getListMultisigConfirmById(
      param,
    );
  }

  @Post(URL_CONSTANTS.SEND)
  @ApiOperation({ summary: 'Send transaction to AURA',
                  description: `It is used to owner of safe broadcast transaction to network. When it failed will throw information. 
                  When it success, update transaction txHash to DB. Multisig sync service will crawl data from network then update result of transaction.` })
  @ApiOkResponse({ status: 200, type: MODULE_RESPONSE.ResponseDto, description: 'The result returned is the ResponseDto class', schema: {} })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async sendTransaction(
    @Body() request: MODULE_REQUEST.SendTransactionRequest,
  ) {
    this._logger.log('========== Send transaction to AURA ==========');
    return this.transactionService.sendTransaction(request);
  }

  @Get(URL_CONSTANTS.TRANSACTION_DETAILS)
  @ApiOperation({
    summary: 'Get details of a transaction',
  })
  async getTransactionDetails(
    @Param() param: MODULE_REQUEST.GetTransactionDetailsParam
  ) {
    this._logger.log('========== Get details of a Transaction ==========');
    return this.transactionService.getTransactionDetails(
      param,
    );
  }
}
