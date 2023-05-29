import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { CustomError } from '../../common/custom-error';
import { COMMON_CONSTANTS } from '../../common/constants/app.constant';
import { ChainRepository } from '../chain/chain.repository';
import { UserRepository } from '../user/user.repository';
import { RequestAuthDto } from './dto/request-auth.dto';
import { AuthUtil } from '../../utils/auth.util';
import { ContextProvider } from '../../providers/contex.provider';
import { AuthResponseDto, UserInfoDto } from './dto';
import { ChainGateway } from '../../chains/chain.gateway';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private chainRepo: ChainRepository,
    private userRepo: UserRepository,
  ) {
    this.logger.log('============== Constructor Auth Service ==============');
  }

  /**
   * auth
   * @param request
   * @returns
   */
  async auth(request: RequestAuthDto): Promise<ResponseDto<AuthResponseDto>> {
    try {
      const { pubkey, data, signature, internalChainId } = request;
      const plainData = Buffer.from(data, 'base64').toString('binary');

      // validate input
      if (!COMMON_CONSTANTS.REGEX_BASE64.test(pubkey)) {
        throw new CustomError(ErrorMap.PUBKEY_NOT_BASE64);
      }
      if (!COMMON_CONSTANTS.REGEX_BASE64.test(signature)) {
        throw new CustomError(ErrorMap.SIGNATURE_NOT_BASE64);
      }

      // Find chain
      const chainInfo = await this.chainRepo.findChain(internalChainId);

      const chainGateway = new ChainGateway(chainInfo);
      const address = chainGateway.pubkeyToAddress(pubkey);
      // create message hash from data
      const msg = AuthUtil.createSignMessageByData(address, plainData);
      const resultVerify = await chainGateway.verifySignature(
        signature,
        msg,
        plainToInstance(UserInfoDto, {
          pubkey,
          address,
        }),
      );

      if (!resultVerify) {
        throw new CustomError(ErrorMap.SIGNATURE_VERIFICATION_FAILED);
      }

      // insert user if not exist
      const user = await this.userRepo.createUserIfNotExists(address, pubkey);

      const payload = {
        id: user.id,
        address,
        pubkey,
      };
      const accessToken = this.jwtService.sign(payload);

      return ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        plainToInstance(AuthResponseDto, {
          AccessToken: `${accessToken}`,
          user,
        }),
      );
    } catch (error) {
      return ResponseDto.responseError(AuthService.name, error);
    }
  }

  /**
   * getAuthUser
   * @returns
   */
  static getAuthUser() {
    return ContextProvider.getAuthUser();
  }

  /**
   * setAuthUser
   * @param user
   */
  static setAuthUser(user: UserInfoDto) {
    ContextProvider.setAuthUser(user);
  }
}
