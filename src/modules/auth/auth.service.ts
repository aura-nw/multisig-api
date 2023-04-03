import { Injectable, Logger } from '@nestjs/common';
import { fromBase64 } from '@cosmjs/encoding';
import { JwtService } from '@nestjs/jwt';
import { encodeSecp256k1Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import { plainToInstance } from 'class-transformer';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { CustomError } from '../../common/custom-error';
import { COMMON_CONSTANTS } from '../../common/constants/app.constant';
import { CosmosUtil } from '../../chains/cosmos';
import { ChainRepository } from '../chain/chain.repository';
import { UserRepository } from '../user/user.repository';
import { RequestAuthDto } from './dto/request-auth.dto';
import { AuthUtil } from '../../utils/auth.util';
import { ContextProvider } from '../../providers/contex.provider';
import { AuthResponseDto, UserInfoDto } from './dto';
import { EthermintHelper } from '../../chains/ethermint/ethermint.helper';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private ethermintHelper = new EthermintHelper();

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
      const { prefix, coinDecimals } = chainInfo;

      let address = '';
      let resultVerify = false;
      if (coinDecimals === 18) {
        // get address from pubkey
        address = this.ethermintHelper.pubkeyToCosmosAddress(pubkey, prefix);
        // create message hash from data
        const msg = AuthUtil.createSignMessageByData(address, plainData);
        // verify signature
        resultVerify = this.ethermintHelper.verifySignature(
          signature,
          msg,
          address,
          prefix,
        );
      } else {
        // get address from pubkey
        const pubkeyFormated = encodeSecp256k1Pubkey(fromBase64(pubkey));
        address = pubkeyToAddress(pubkeyFormated, prefix);
        // create message hash from data
        const msg = AuthUtil.createSignMessageByData(address, plainData);
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
