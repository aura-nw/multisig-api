import { ResponseDto } from "src/dtos/responses/response.dto";
import { MODULE_REQUEST } from "src/module.config";

export interface ISimulatingService {
    
    /**
     * simulating creating multisig wallet and create transaction
     * @param request
     */
    simulating(request: MODULE_REQUEST.SimulatingMultisigRequest): Promise<ResponseDto>;
}