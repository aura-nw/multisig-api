import { Controller, Get, Post, Query, Inject, Body } from '@nestjs/common';
import { MODULE_REQUEST, SERVICE_INTERFACE } from 'src/module.config';
import { ISimulatingService } from 'src/services/isimulating.service';

@Controller()
export class SimulatingController {
    constructor(@Inject(SERVICE_INTERFACE.ISIMULATING_SERVICE) private simulatingService: ISimulatingService) { }

	@Post("simulating")
	async simulateMultisigTransactions(@Body() request: MODULE_REQUEST.SimulatingMultisigRequest) {
		return await this.simulatingService.simulating(request);
	}
}
