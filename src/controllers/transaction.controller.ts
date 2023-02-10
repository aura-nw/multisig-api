import {
  Controller,
  Get,
  Post,
  Inject,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Logger,
  Query,
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
} from '../common/constants/api.constant';
import {
  CommonAuthDelete,
  CommonAuthPost,
  CommonGet,
  CommonPost,
} from '../decorators/common.decorator';
import {
  MODULE_REQUEST,
  MODULE_RESPONSE,
  SERVICE_INTERFACE,
} from '../module.config';
import { TransactionService } from '../services/impls/transaction.service';
import { IMultisigTransactionService } from '../services/imultisig-transaction.service';

@Controller(CONTROLLER_CONSTANTS.TRANSACTION)
@ApiTags(CONTROLLER_CONSTANTS.TRANSACTION)
export class TransactionController {
  public readonly _logger = new Logger(TransactionController.name);

  constructor(
    @Inject(SERVICE_INTERFACE.ITRANSACTION_SERVICE)
    private transactionService: TransactionService,
    @Inject(SERVICE_INTERFACE.IMULTISIG_TRANSACTION_SERVICE)
    private multisigTransactionService: IMultisigTransactionService,
  ) {}

  @CommonAuthPost({
    url: URL_CONSTANTS.CREATE,
    summary: 'API Create multisig transaction',
    description: `It is used to allow owner of safe create transaction transfer native coin with another address. 
    Firs of all, owner must sign transaction via wallet extension then get signature and bodyBytes, what is result of action sign. Then call API to create transaction.`,
  })
  async createTransaction(
    @Body() request: MODULE_REQUEST.CreateTransactionRequest,
  ) {
    this._logger.log('========== Create multisig transaction ==========');
    return this.multisigTransactionService.createMultisigTransaction(request);
  }

  @CommonAuthPost({
    url: URL_CONSTANTS.CHANGE_SEQ,
    summary: 'API Change sequence of multisig transaction',
  })
  async changeSeqTransaction(
    @Body() request: MODULE_REQUEST.ChangeSequenceTransactionRequest,
  ) {
    this._logger.log(
      '========== Change sequence of multisig transaction ==========',
    );
    return this.multisigTransactionService.changeSequence(request);
  }

  @CommonAuthPost({
    url: URL_CONSTANTS.CONFIRM_TRANSACTION,
    summary: 'API Owner confirm their transaction. ',
    description: `It is used to owner of safe sign transaction. When transaction meet threshold, it changes to status AWAITING_EXECUTION ready to broadcast to network.`,
  })
  async confirmTransaction(
    @Body() request: MODULE_REQUEST.ConfirmTransactionRequest,
  ) {
    return this.multisigTransactionService.confirmMultisigTransaction(request);
  }

  @CommonAuthPost({
    url: URL_CONSTANTS.REJECT_TRANSACTION,
    summary: 'Owner reject their transaction',
    description: `It is used to owner of safe reject transaction.`,
  })
  async rejectTransaction(
    @Body() request: MODULE_REQUEST.RejectTransactionParam,
  ) {
    return this.multisigTransactionService.rejectMultisigTransaction(request);
  }

  @Post(URL_CONSTANTS.GET_ALL_TXS)
  @ApiOperation({
    summary: 'Returns a paginated list of transactions for a Safe',
  })
  @ApiOkResponse({
    status: 200,
    type: MODULE_RESPONSE.MultisigTransactionHistoryResponse,
    isArray: true,
    description: 'Get Transaction History of a Safe',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getAllTxs(@Body() request: MODULE_REQUEST.GetAllTransactionsRequest) {
    this._logger.log('========== Get All Transactions ==========');
    return this.transactionService.getTransactionHistory(request);
  }

  @Get(URL_CONSTANTS.SIGNATURES)
  @ApiOperation({
    summary: 'Get the list of signatures for a multisig transaction',
  })
  @ApiOkResponse({
    status: 200,
    type: MODULE_RESPONSE.MultisigSignatureResponse,
    description: 'List signature of multisig',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  async getSignaturesOfMultisigTx(
    @Param() param: MODULE_REQUEST.GetMultisigSignaturesParam,
  ) {
    this._logger.log(
      '========== Get Signatures of Multisig Transaction ==========',
    );
    return this.transactionService.getListMultisigConfirmById(param);
  }

  @CommonAuthPost({
    url: URL_CONSTANTS.SEND,
    summary: 'Send transaction to AURA',
    description: `It is used to owner of safe broadcast transaction to network. When it failed will throw information. 
    When it success, update transaction txHash to DB. Multisig sync service will crawl data from network then update result of transaction.`,
  })
  async sendTransaction(
    @Body() request: MODULE_REQUEST.SendTransactionRequest,
  ) {
    this._logger.log('========== Send transaction to AURA ==========');
    return this.multisigTransactionService.sendMultisigTransaction(request);
  }

  @Get(URL_CONSTANTS.TRANSACTION_DETAILS)
  @ApiOperation({
    summary: 'Get details of a transaction',
  })
  @ApiOkResponse({
    status: 200,
    type: MODULE_RESPONSE.TransactionDetailsResponse,
    description: 'Details of a Transaction',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getTransactionDetails(@Query() query: MODULE_REQUEST.GetTxDetailQuery) {
    this._logger.log('========== Get details of a Transaction ==========');
    return this.transactionService.getTransactionDetails(query);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_ADDRESS_SIMULATE,
    summary: 'Get simulate addresses',
    description: 'Get simulate addresses',
  })
  async getSimulateAddresses(
    @Query() request: MODULE_REQUEST.GetSimulateAddressQuery,
  ) {
    this._logger.log('========== Get simulate addresses ==========');
    return this.multisigTransactionService.getSimulateAddresses(request);
  }

  @CommonPost({
    url: URL_CONSTANTS.SIMULATE_TX,
    summary: 'Simulate transaction',
    description: 'Simulate transaction',
  })
  async simulateTransaction(@Body() request: MODULE_REQUEST.SimulateTxRequest) {
    this._logger.log('========== Simulate transaction ==========');
    return this.multisigTransactionService.simulate(request);
  }

  @CommonAuthDelete({
    url: URL_CONSTANTS.DELETE_TX,
    summary: 'Delete transaction',
    description: 'Delete transaction',
  })
  async deleteTransaction(@Body() request: MODULE_REQUEST.DeleteTxRequest) {
    this._logger.log('========== Delete transaction ==========');
    return this.multisigTransactionService.deleteTransaction(request);
  }
}
