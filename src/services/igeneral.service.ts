import { ResponseDto } from "src/dtos/responses/response.dto";

export interface IGeneralService {

    /**
     * Show network list
     */
    showNetworkList(): Promise<ResponseDto>

    /**
     * Get account onchain
     */
    getAccountOnchain(safeAddress: string, internalChainId: number): Promise<ResponseDto>
}