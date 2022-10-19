import { ResponseDto } from 'src/dtos/responses/response.dto';
import { MODULE_REQUEST } from 'src/module.config';

export interface IAuthService {
  /**
   *
   * @param request
   */
  auth(request: MODULE_REQUEST.AuthRequest): Promise<ResponseDto>;
}
