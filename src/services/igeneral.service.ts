import { ResponseDto } from "src/dtos/responses/response.dto";

export interface IGeneralService {

    /**
     * Show network list
     */
    showNetworkList(): Promise<ResponseDto>

    /**
     * Get account onchain
     */
    getAccountOnchain(safeAddress: string, rpc: string): Promise<ResponseDto>
}