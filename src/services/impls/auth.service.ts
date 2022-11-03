import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from '../../dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { IAuthService } from '../iauth.service';
import { fromBase64 } from '@cosmjs/encoding';
import { JwtService } from '@nestjs/jwt';
import { CustomError } from '../../common/customError';
import { encodeSecp256k1Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import {
  AppConstants,
  COMMON_CONSTANTS,
} from '../../common/constants/app.constant';
import { ContextService } from '../../../providers/context.service';
import { IGeneralRepository } from '../../repositories';
import {
  createSignMessageByData,
  pubkeyToAddressEvmos,
  verifyCosmosSig,
  verifyEvmosSig,
} from '../../chains';
import { UserInfo } from '../../dtos/userInfo';
import { IUserRepository } from '../../repositories/iuser.repository';
@Injectable()
export class AuthService implements IAuthService {
  private readonly _logger = new Logger(AuthService.name);
  private static _authUserKey = AppConstants.USER_KEY;

  constructor(
    private jwtService: JwtService,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private chainRepo: IGeneralRepository,
    @Inject(REPOSITORY_INTERFACE.IUSER_REPOSITORY)
    private userRepo: IUserRepository,
  ) {
    this._logger.log('============== Constructor Auth Service ==============');
  }
  async auth(request: MODULE_REQUEST.AuthRequest): Promise<ResponseDto> {
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
      const prefix = chainInfo.prefix;

      let address = '';
      let resultVerify = false;
      if (chainInfo.chainId.startsWith('evmos_')) {
        // get address from pubkey
        address = pubkeyToAddressEvmos(pubkey);
        // create message hash from data
        const msg = createSignMessageByData(address, plainData);
        // verify signature
        resultVerify = await verifyEvmosSig(signature, msg, address);
      } else {
        // get address from pubkey
        const pubkeyFormated = encodeSecp256k1Pubkey(fromBase64(pubkey));
        address = pubkeyToAddress(pubkeyFormated, prefix);
        // create message hash from data
        const msg = createSignMessageByData(address, plainData);
        // verify signature
        resultVerify = await verifyCosmosSig(
          signature,
          msg,
          fromBase64(pubkey),
        );
        // resultVerify = await verifyADR36Amino(prefix, address, plainData, fromBase64(pubkey), fromBase64(signature))
      }
      if (!resultVerify) {
        throw new CustomError(ErrorMap.SIGNATURE_VERIFICATION_FAILED);
      }

      const payload = {
        address: address,
        pubkey: pubkey,
        // data: data,
        signature: signature,
      };
      const accessToken = this.jwtService.sign(payload);

      // insert user if not exist
      const user = await this.userRepo.createUserIfNotExists(address, pubkey);

      return ResponseDto.response(ErrorMap.SUCCESSFUL, {
        AccessToken: `${accessToken}`,
        user,
      });
    } catch (error) {
      return ResponseDto.responseError(AuthService.name, error);
    }
  }

  static getAuthUser() {
    return ContextService.get(AuthService._authUserKey);
  }

  static setAuthUser(user: UserInfo) {
    ContextService.set(AuthService._authUserKey, user);
  }
}
