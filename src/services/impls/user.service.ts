import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import {
  MODULE_REQUEST,
  REPOSITORY_INTERFACE,
} from 'src/module.config';
import { Chain } from 'src/entities';
import { IUserService } from '../iuser.service';
import { IUserRepository } from 'src/repositories/iuser.repository';

@Injectable()
export class UserService implements IUserService {
  private readonly _logger = new Logger(UserService.name);
  auraChain: Chain;
  indexerUrl: string;

  constructor(
    @Inject(REPOSITORY_INTERFACE.IUSER_REPOSITORY)
    private userRepo: IUserRepository,
  ) {
    this._logger.log(
      '============== Constructor User Service ==============',
    );
  }
  
  async getUserByAddress(param: MODULE_REQUEST.GetUserPathParams): Promise<ResponseDto> {
      const { address } = param;
      try {
        const user = await this.userRepo.getUserByAddress(address);
        return ResponseDto.response(ErrorMap.SUCCESSFUL, user);
      } catch (e) {
        return ResponseDto.responseError(UserService.name, e);
      }
  }
}
