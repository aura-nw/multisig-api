import { Controller, Get, Post, Query, Inject, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CONTROLLER_CONSTANTS } from 'src/common/constants/api.constant';
import { MODULE_REQUEST, SERVICE_INTERFACE } from 'src/module.config';
import { IMultisigWalletService } from 'src/services/imultisig-wallet.service';
@Controller(CONTROLLER_CONSTANTS.MULTISIG_WALLET)
@ApiTags(CONTROLLER_CONSTANTS.MULTISIG_WALLET)
export class MultisigWalletController {
    constructor(@Inject(SERVICE_INTERFACE.IMULTISIG_WALLET_SERVICE) private multisigWalletService: IMultisigWalletService) { }

	@Post()
	@ApiOperation({ summary: 'Create a multisig wallet' })
	async createMultisigWallet(@Body() request: MODULE_REQUEST.CreateMultisigWalletRequest) {
		return await this.multisigWalletService.createMultisigWallet(request);
	}
}
