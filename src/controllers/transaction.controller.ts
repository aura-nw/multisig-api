import { Controller, Get, Post, Query, Inject, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CONTROLLER_CONSTANTS, URL_CONSTANTS } from 'src/common/constants/api.constant';
import { MODULE_REQUEST, SERVICE_INTERFACE } from 'src/module.config';
import { ISimulatingService } from 'src/services/isimulating.service';
import { ITransactionService } from 'src/services/transaction.service';

@Controller(CONTROLLER_CONSTANTS.TRANSACTION)
@ApiTags(CONTROLLER_CONSTANTS.TRANSACTION)
export class TransactionController {
    constructor(@Inject(SERVICE_INTERFACE.ITRANSACTION_SERVICE) private transactionService: ITransactionService) { }

	@Post()
    @ApiOperation({ summary: 'create transaction from a multisig wallet' })
	async createTransaction(@Body() request: MODULE_REQUEST.CreateTransactionRequest) {
		return await this.transactionService.createTransaction(request);
	}

    @Post(URL_CONSTANTS.signing)
    @ApiOperation({ summary: 'owner sign to their transaction' })
	async signTransaction(@Body() request: MODULE_REQUEST.SingleSignTransactionRequest) {
		return await this.transactionService.singleSignTransaction(request);
	}

    @Post(URL_CONSTANTS.broadcasting)
    @ApiOperation({ summary: 'owner broadcast their transaction' })
	async broadcastTransaction(@Body() request: MODULE_REQUEST.BroadcastTransactionRequest) {
		return await this.transactionService.broadcastTransaction(request);
	}
}
