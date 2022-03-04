import { Inject, Logger } from "@nestjs/common";
import { StargateClient } from "@cosmjs/stargate";
import { ResponseDto } from "src/dtos/responses/response.dto";
import { IGeneralService } from "../igeneral.service";
import { ConfigService } from "src/shared/services/config.service";
import { BaseService } from "./base.service";
import { CommonUtil } from "src/utils/common.util";
import { REPOSITORY_INTERFACE } from "src/module.config";
import { IGeneralRepository } from "src/repositories/igeneral.repository";
import { ErrorMap } from "src/common/error.map";

export class GeneralService extends BaseService implements IGeneralService {
    private readonly _logger = new Logger(GeneralService.name);
    private _commonUtil: CommonUtil = new CommonUtil();
    constructor(
        private configService: ConfigService,
        @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
        private chainRepo: IGeneralRepository,
    ) {
        super(chainRepo);
        this._logger.log("============== Constructor General Service ==============");
    }

    async showNetworkList(): Promise<ResponseDto> {
        const res = new ResponseDto();
        const result = await this.chainRepo.showNetworkList();
        return res.return(ErrorMap.SUCCESSFUL, result);
    }

    async getAccountOnchain(safeAddress: string, internalChainId: number): Promise<ResponseDto> {
        const res = new ResponseDto();
        try {
            const condition = { id: internalChainId };
            const chain = await this.chainRepo.findByCondition(condition);
            const client = await StargateClient.connect(chain[0].rpc);
            const accountOnChain = await client.getAccount(safeAddress);
            const balance = await client.getBalance(safeAddress, chain[0].denom);
            return res.return(ErrorMap.SUCCESSFUL, { accountOnChain, balance });
        } catch (error) {
            console.log(error);
        }
    }
}