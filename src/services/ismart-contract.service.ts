import { ResponseDto } from "src/dtos/responses";
import { MODULE_REQUEST } from "src/module.config";

export interface ISmartContractService {
    /**
     * Call a read function of a smart contract
     * @param request 
     */
    queryMessage(request: MODULE_REQUEST.QueryMessageRequest): Promise<ResponseDto>;

    /**
     * Call a write function of a smart contract
     * @param request 
     */
    createExecuteMessage(request: MODULE_REQUEST.ExecuteMessageRequest): Promise<ResponseDto>;
}