import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
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
import { CommonAuthPost } from 'src/decorators/common.decorator';
import {
  MODULE_REQUEST,
  MODULE_RESPONSE,
  SERVICE_INTERFACE,
} from 'src/module.config';
import { SmartContractService } from 'src/services/impls/smart-contract.service';

@Controller(CONTROLLER_CONSTANTS.SMART_CONTRACT)
@ApiTags(CONTROLLER_CONSTANTS.SMART_CONTRACT)
export class SmartContractController {
  public readonly _logger = new Logger(SmartContractController.name);

  constructor(
    @Inject(SERVICE_INTERFACE.ISMART_CONTRACT_SERVICE)
    private smartContractService: SmartContractService,
  ) {}

  @Post(URL_CONSTANTS.QUERY_MESSAGE)
  @ApiOperation({
    summary: 'API to call read function of smart contract',
    description: `It is used to call a read function of a smart contract and return the result.`,
  })
  @ApiOkResponse({
    status: 200,
    type: MODULE_RESPONSE.ResponseDto,
    description: 'The result returned is the ResponseDto class',
    schema: {},
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  @HttpCode(HttpStatus.OK)
  async queryMessage(@Body() request: MODULE_REQUEST.QueryMessageRequest) {
    this._logger.log('========== Query message smart contract ==========');
    return this.smartContractService.queryMessage(request);
  }

  @CommonAuthPost({
    url: URL_CONSTANTS.CREATE_EXECUTE_MESSAGE,
    summary: 'API to call write function of smart contract',
    description: `It is used to call a write function of a smart contract and return the result.`,
  })
  async createExecuteMessage(
    @Body() request: MODULE_REQUEST.ExecuteMessageRequest,
  ) {
    this._logger.log('========== Execute message smart contract ==========');
    return this.smartContractService.createExecuteMessage(request);
  }

  @CommonAuthPost({
    url: URL_CONSTANTS.CONFIRM_EXECUTE_MESSAGE,
    summary: 'API to call write function of smart contract',
    description: `It is used to call a write function of a smart contract and return the result.`,
  })
  async confirmExecuteMessage(
    @Body() request: MODULE_REQUEST.ConfirmTransactionRequest,
  ) {
    this._logger.log('========== Execute message smart contract ==========');
    return this.smartContractService.confirmExecuteMessage(request);
  }

  @CommonAuthPost({
    url: URL_CONSTANTS.REJECT_EXECUTE_MESSAGE,
    summary: 'API to call write function of smart contract',
    description: `It is used to call a write function of a smart contract and return the result.`,
  })
  async rejectExecuteMessage(
    @Body() request: MODULE_REQUEST.RejectTransactionParam,
  ) {
    this._logger.log('========== Execute message smart contract ==========');
    return this.smartContractService.rejectExecuteMessage(request);
  }

  @CommonAuthPost({
    url: URL_CONSTANTS.SEND_EXECUTE_MESSAGE,
    summary: 'API to call write function of smart contract',
    description: `It is used to call a write function of a smart contract and return the result.`,
  })
  async sendExecuteMessage(
    @Body() request: MODULE_REQUEST.SendTransactionRequest,
  ) {
    this._logger.log('========== Execute message smart contract ==========');
    return this.smartContractService.sendExecuteMessage(request);
  }
}
