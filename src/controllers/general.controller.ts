import { Controller, Get, HttpCode, HttpStatus, Inject, Param, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CONTROLLER_CONSTANTS, URL_CONSTANTS } from "src/common/constants/api.constant";
import { MODULE_RESPONSE, SERVICE_INTERFACE } from "src/module.config";
import { IGeneralService } from "src/services/igeneral.service";

@Controller(CONTROLLER_CONSTANTS.GENERAL)
@ApiTags(CONTROLLER_CONSTANTS.GENERAL)
export class GeneralController {
    constructor(
        @Inject(SERVICE_INTERFACE.IGENERAL_SERVICE)
        private generalService: IGeneralService
    ) { }

    @Post(URL_CONSTANTS.NETWORK_LIST)
    @ApiOperation({ summary: 'Show network list' })
    @ApiOkResponse({ status: 200, type: MODULE_RESPONSE.NetworkListResponse, description: 'Show list of networks', schema: {} })
    @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
    @HttpCode(HttpStatus.OK)
    async showNetworkList() {
        return await this.generalService.showNetworkList();
    }

    @Get('get-account-onchain/:safeAddress/:internalChainId')
    @ApiOperation({ summary: 'Get account onchain' })
    async getAccountOnchain(
        @Param('safeAddress') safeAddress: string,
        @Param('internalChainId') internalChainId: number
    ) {
        return await this.generalService.getAccountOnchain(safeAddress, internalChainId);
    }
}