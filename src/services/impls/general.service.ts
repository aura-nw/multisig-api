import { Logger } from "@nestjs/common";
import { ResponseDto } from "src/dtos/responses/response.dto";
import { IGeneralService } from "../igeneral.service";
import { ConfigService } from "src/shared/services/config.service";

export class GeneralService implements IGeneralService {
    private readonly _logger = new Logger(GeneralService.name);
    constructor(
        private configService: ConfigService,
    ) {
        this._logger.log("============== Constructor General Service ==============");
    }

    async showNetworkList(): Promise<ResponseDto> {
        
        return null
    }

}