import { ResponseDto } from 'src/dtos/responses/response.dto';
import { MODULE_REQUEST } from 'src/module.config';

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

  /**
   * getValidators
   * @param param
   */
  getValidators(param: MODULE_REQUEST.GetValidatorsParam);
}
