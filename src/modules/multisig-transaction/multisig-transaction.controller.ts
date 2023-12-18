import {
  Controller,
  Get,
  Post,
  Body,
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
} from '../../common/constants/api.constant';
import {
  CommonAuthDelete,
  CommonAuthPost,
  CommonGet,
  CommonPost,
} from '../../decorators/common.decorator';
import { MultisigTransactionHistoryResponseDto } from './dto/response/transaction-history.res';
import { MultisigTransactionService } from './multisig-transaction.service';
import {
  ChangeSequenceTransactionRequestDto,
  ConfirmTransactionRequestDto,
  CreateTransactionRequestDto,
  GetAllTransactionsRequestDto,
  GetNextSeqQueryDto,
  GetSimulateAddressQueryDto,
  GetTxDetailQueryDto,
  RejectTransactionRequestDto,
  SendTransactionRequestDto,
  SimulateTxRequestDto,
  TxDetailDto,
} from './dto';
import { DeleteTxRequestDto } from './dto/request/delete-tx.req';

@Controller(CONTROLLER_CONSTANTS.TRANSACTION)
@ApiTags(CONTROLLER_CONSTANTS.TRANSACTION)
export class MultisigTransactionController {
  public readonly logger = new Logger(MultisigTransactionController.name);

  constructor(private multisigTransactionService: MultisigTransactionService) { }

  @CommonAuthPost({
    url: URL_CONSTANTS.CREATE,
    summary: 'API Create multisig transaction',
    description: `It is used to allow owner of safe create transaction transfer native coin with another address.
    Firs of all, owner must sign transaction via wallet extension then get signature and bodyBytes, what is result of action sign. Then call API to create transaction.`,
  })
  async createTransaction(@Body() request: CreateTransactionRequestDto) {
    this.logger.log('========== Create multisig transaction ==========');
    return this.multisigTransactionService.createMultisigTransaction(request);
  }

  @CommonAuthPost({
    url: URL_CONSTANTS.CHANGE_SEQ,
    summary: 'API Change sequence of multisig transaction',
  })
  async changeSeqTransaction(
    @Body() request: ChangeSequenceTransactionRequestDto,
  ) {
    this.logger.log(
      '========== Change sequence of multisig transaction ==========',
    );
    return this.multisigTransactionService.changeSequence(request);
  }

  @CommonAuthPost({
    url: URL_CONSTANTS.CONFIRM_TRANSACTION,
    summary: 'API Owner confirm their transaction. ',
    description:
      'It is used to owner of safe sign transaction. When transaction meet threshold, it changes to status AWAITING_EXECUTION ready to broadcast to network.',
  })
  async confirmTransaction(@Body() request: ConfirmTransactionRequestDto) {
    return this.multisigTransactionService.confirmMultisigTransaction(request);
  }

  @CommonAuthPost({
    url: URL_CONSTANTS.REJECT_TRANSACTION,
    summary: 'Owner reject their transaction',
    description: 'It is used to owner of safe reject transaction.',
  })
  async rejectTransaction(@Body() request: RejectTransactionRequestDto) {
    return this.multisigTransactionService.rejectMultisigTransaction(request);
  }

  @Post(URL_CONSTANTS.GET_ALL_TXS)
  @ApiOperation({
    summary: 'Returns a paginated list of transactions for a Safe',
  })
  @ApiOkResponse({
    status: 200,
    type: MultisigTransactionHistoryResponseDto,
    isArray: true,
    description: 'Get Transaction History of a Safe',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getAllTxs(@Body() request: GetAllTransactionsRequestDto) {
    this.logger.log('========== Get All Transactions ==========');
    return this.multisigTransactionService.getTransactionHistory(request);
  }

  @CommonAuthPost({
    url: URL_CONSTANTS.SEND,
    summary: 'Send transaction to AURA',
    description: `It is used to owner of safe broadcast transaction to network. When it failed will throw information.
    When it success, update transaction txHash to DB. Multisig sync service will crawl data from network then update result of transaction.`,
  })
  async sendTransaction(@Body() request: SendTransactionRequestDto) {
    this.logger.log('========== Send transaction to AURA ==========');
    return this.multisigTransactionService.sendMultisigTransaction(request);
  }

  @Get(URL_CONSTANTS.TRANSACTION_DETAILS)
  @ApiOperation({
    summary: 'Get details of a transaction',
  })
  @ApiOkResponse({
    status: 200,
    type: TxDetailDto,
    description: 'Details of a Transaction',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async getTransactionDetail(@Query() query: GetTxDetailQueryDto) {
    this.logger.log('========== Get details of a Transaction ==========');
    return this.multisigTransactionService.getTransactionDetail(query);
  }



  @CommonGet({
    url: URL_CONSTANTS.GET_NEXT_SEQUENCE,
    summary: 'Get simulate addresses',
    description: 'Get simulate addresses',
  })
  async getNextSeq(@Query() request: GetNextSeqQueryDto) {
    this.logger.log('========== Get next sequence ==========');
    return this.multisigTransactionService.getNextSequence(request.safeId);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_ADDRESS_SIMULATE,
    summary: 'Get simulate addresses',
    description: 'Get simulate addresses',
  })
  async getSimulateAddresses(@Query() request: GetSimulateAddressQueryDto) {
    this.logger.log('========== Get simulate addresses ==========');
    return this.multisigTransactionService.getSimulateAddresses(request);
  }

  @CommonPost({
    url: URL_CONSTANTS.SIMULATE_TX,
    summary: 'Simulate transaction',
    description: 'Simulate transaction',
  })
  async simulateTransaction(@Body() request: SimulateTxRequestDto) {
    this.logger.log('========== Simulate transaction ==========');
    return this.multisigTransactionService.simulate(request);
  }

  @CommonAuthDelete({
    url: URL_CONSTANTS.DELETE_TX,
    summary: 'Delete transaction',
    description: 'Delete transaction',
  })
  async deleteTransaction(@Body() request: DeleteTxRequestDto) {
    this.logger.log('========== Delete transaction ==========');
    return this.multisigTransactionService.deleteTransaction(request);
  }
}
