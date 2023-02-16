import { Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from '../../dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { UserRepository } from './user.repository';
import { GetUserPathParamDto } from './dto/request/get-user.req';
import { Chain } from '../chain/entities/chain.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  auraChain: Chain;
  indexerUrl: string;

  constructor(private userRepo: UserRepository) {
    this.logger.log('============== Constructor User Service ==============');
  }

  async getUserByAddress(param: GetUserPathParamDto): Promise<ResponseDto> {
    const { address } = param;
    try {
      const user = await this.userRepo.getUserByAddress(address);
      return ResponseDto.response(ErrorMap.SUCCESSFUL, user);
    } catch (e) {
      return ResponseDto.responseError(UserService.name, e);
    }
  }
}
