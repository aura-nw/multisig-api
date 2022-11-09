import { ResponseDto } from '../dtos/responses/response.dto';
import { MODULE_REQUEST } from '../module.config';

export interface IUserService {
  /**
   * getUserByAddress
   * @param address
   */
  getUserByAddress(
    param: MODULE_REQUEST.GetUserPathParams,
  ): Promise<ResponseDto>;
}
