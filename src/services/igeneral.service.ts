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

  /**
   * getDelegatorRewards
   * @param param
   */
  getDelegatorRewards(param: MODULE_REQUEST.GetDelegatorRewardsParam);

  /**
   * getDelegationInformation
   * @param param
   */
  getDelegationInformation(
    param: MODULE_REQUEST.GetDelegationInformationParam,
    query: MODULE_REQUEST.GetDelegationInformationQuery,
  );
}
