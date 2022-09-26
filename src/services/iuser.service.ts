import { ResponseDto } from 'src/dtos/responses/response.dto';
import { MODULE_REQUEST } from 'src/module.config';

export interface IUserService {
  /**
   * getUserByAddress
   * @param address 
   */
  getUserByAddress(param: MODULE_REQUEST.GetUserPathParams): Promise<ResponseDto>;
}
