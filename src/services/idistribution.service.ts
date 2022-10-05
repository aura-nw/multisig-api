import { ResponseDto } from 'src/dtos/responses';
import { MODULE_REQUEST } from 'src/module.config';

export interface IDistributionService {
  getValidators(
    param: MODULE_REQUEST.GetValidatorsParam,
    query: MODULE_REQUEST.GetValidatorsQuery,
  ): Promise<ResponseDto>;
  getDelegations(
    param: MODULE_REQUEST.GetDelegationInformationParam,
  ): Promise<ResponseDto>;
  getUndelegations(
    param: MODULE_REQUEST.GetUndelegationsParam,
  ): Promise<ResponseDto>;
}
