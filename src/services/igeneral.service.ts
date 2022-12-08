import { ResponseDto } from '../dtos/responses/response.dto';
import { MODULE_REQUEST } from '../module.config';

export interface IGeneralService {
  /**
   * Show network list
   */
  showNetworkList(): Promise<ResponseDto>;

  /**
   * Get account onchain
   */
  getAccountOnchain(
    param: MODULE_REQUEST.GetAccountOnchainParam,
  ): Promise<ResponseDto>;
}
