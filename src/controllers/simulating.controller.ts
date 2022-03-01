import { Controller, Post, Inject, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CONTROLLER_CONSTANTS } from 'src/common/constants/api.constant';
import { MODULE_REQUEST, SERVICE_INTERFACE } from 'src/module.config';
import { ISimulatingService } from 'src/services/isimulating.service';

@Controller(CONTROLLER_CONSTANTS.SIMULATING)
@ApiTags(CONTROLLER_CONSTANTS.SIMULATING)
export class SimulatingController {
  constructor(
    @Inject(SERVICE_INTERFACE.ISIMULATING_SERVICE)
    private simulatingService: ISimulatingService,
  ) { }

  @Post()
  @ApiOperation({
    summary: 'simulating creating a multisig wallet and make a transaction',
  })
  async simulateMultisigTransactions(
    @Body() request: MODULE_REQUEST.SimulatingMultisigRequest,
  ) {
    return this.simulatingService.simulating(request);
  }
  @Post('signDeleteSafe')
  @ApiOperation({ summary: 'simulating sign delete safe' })
  async simulateSignMsg(
    @Body() request: MODULE_REQUEST.SimulatingSignMsgRequest,
  ) {
    return this.simulatingService.simulateSignDeleteSafe(request);
  }
}
