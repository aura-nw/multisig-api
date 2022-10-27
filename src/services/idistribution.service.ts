import { ResponseDto } from 'src/dtos/responses';
import { MODULE_REQUEST } from 'src/module.config';

export interface IDistributionService {
  getValidators(
    param: MODULE_REQUEST.GetValidatorsParam,
    query: MODULE_REQUEST.GetValidatorsQuery,
  ): Promise<ResponseDto>;
  getDelegations(
    param: MODULE_REQUEST.GetDelegationsParam,
  ): Promise<ResponseDto>;
  getDelegation(query: MODULE_REQUEST.GetDelegationQuery): Promise<ResponseDto>;
  getUndelegations(
    param: MODULE_REQUEST.GetUndelegationsParam,
  ): Promise<ResponseDto>;

  getValidatorInfo(
    param: MODULE_REQUEST.GetValidatorPathParams,
  ): Promise<ResponseDto>;
}
