import { Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { BroadcastRequest } from '../dtos/requests/broadcast.request';
import { CreateMultisigRequest } from '../dtos/requests//createMultisig.request';
import { CreateTransactionRequest } from '../dtos/requests//createTransaction.request';
import { SingleSignRequest } from '../dtos/requests//singleSign.request';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) { }

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Post("transaction")
	async createTransaction(@Query() req: CreateTransactionRequest) {
		return await this.appService.createTransaction(req);
	}

	@Post("multisig")
	async createMultisigWallet(@Query() req: CreateMultisigRequest) {
		return await this.appService.createMultisigWallet(req);
	}

	@Post("sign")
	async singleSign(@Query() req: SingleSignRequest) {
		return await this.appService.singleSign(req);
	}

	@Post("broadcast")
	async broadcast(@Query() req: BroadcastRequest) {
		return await this.appService.broadcast(req);
	}

	@Post("simulating")
	async simulateMultisigTransactions() {
		return await this.appService.simulateMultisigTransaction();
	}
}
