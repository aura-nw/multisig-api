import { ResponseDto } from '../dtos/responses/response.dto';
import { MODULE_REQUEST } from '../module.config';

export interface IAuthService {
  /**
   *
   * @param request
   */
  auth(request: MODULE_REQUEST.AuthRequest): Promise<ResponseDto>;
}
