import { Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { fromBase64 } from '@cosmjs/encoding';
import { JwtService } from '@nestjs/jwt';
import { CustomError } from '../../common/customError';
import { encodeSecp256k1Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import {
  AppConstants,
  COMMON_CONSTANTS,
} from '../../common/constants/app.constant';
import { ContextService } from '../../providers/context.service';
import { CommonUtil } from '../../utils/common.util';
import { pubkeyToAddressEvmos, verifyEvmosSig } from '../../chains/evmos';
import { CosmosUtil } from '../../chains/cosmos';
import { ChainRepository } from '../chain/chain.repository';
import { UserRepository } from '../user/user.repository';
import { RequestAuthDto } from './dto/request-auth.dto';
import { UserInfoDto } from './dto/user-info.dto';
@Injectable()
export class AuthService {
  private readonly _logger = new Logger(AuthService.name);
  private static _authUserKey = AppConstants.USER_KEY;

  constructor(
    private jwtService: JwtService,
    private chainRepo: ChainRepository,
    private userRepo: UserRepository,
  ) {
    this._logger.log('============== Constructor Auth Service ==============');
  }

  /**
   * auth
   * @param request
   * @returns
   */
  async auth(request: RequestAuthDto): Promise<ResponseDto> {
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
        const msg = CommonUtil.createSignMessageByData(address, plainData);
        // verify signature
        resultVerify = await verifyEvmosSig(signature, msg, address);
      } else {
        // get address from pubkey
        const pubkeyFormated = encodeSecp256k1Pubkey(fromBase64(pubkey));
        address = pubkeyToAddress(pubkeyFormated, prefix);
        // create message hash from data
        const msg = CommonUtil.createSignMessageByData(address, plainData);
        // verify signature
        resultVerify = await CosmosUtil.verifyCosmosSig(
          signature,
          msg,
          fromBase64(pubkey),
        );
      }
      if (!resultVerify) {
        throw new CustomError(ErrorMap.SIGNATURE_VERIFICATION_FAILED);
      }

      // insert user if not exist
      const user = await this.userRepo.createUserIfNotExists(address, pubkey);

      const payload = {
        userId: user.id,
        address: address,
        pubkey: pubkey,
        // data: data,
        signature: signature,
      };
      const accessToken = this.jwtService.sign(payload);

      return ResponseDto.response(ErrorMap.SUCCESSFUL, {
        AccessToken: `${accessToken}`,
        user,
      });
    } catch (error) {
      return ResponseDto.responseError(AuthService.name, error);
    }
  }

  /**
   * getAuthUser
   * @returns
   */
  static getAuthUser() {
    return ContextService.get(AuthService._authUserKey);
  }

  /**
   * setAuthUser
   * @param user
   */
  static setAuthUser(user: UserInfoDto) {
    ContextService.set(AuthService._authUserKey, user);
  }
}
