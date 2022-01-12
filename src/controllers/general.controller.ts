import { Controller, Get, Inject, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CONTROLLER_CONSTANTS } from "src/common/constants/api.constant";
import { SERVICE_INTERFACE } from "src/module.config";
import { IGeneralService } from "src/services/igeneral.service";

@Controller(CONTROLLER_CONSTANTS.GENERAL)
@ApiTags(CONTROLLER_CONSTANTS.GENERAL)
export class GeneralController {
    constructor(
        @Inject(SERVICE_INTERFACE.IGENERAL_SERVICE)
        private generalService: IGeneralService
    ) {}

    @Post('network-list')
    @ApiOperation({ summary: 'Show network list' })
    async showNetworkList() {
        return await this.generalService.showNetworkList();
    }
}