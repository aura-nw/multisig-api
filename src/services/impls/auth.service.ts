import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from 'src/module.config';
import { ConfigService } from 'src/shared/services/config.service';
import { IAuthService } from '../iauth.service';
import { sha256, Secp256k1, Secp256k1Signature } from '@cosmjs/crypto';
import { serializeSignDoc } from '@cosmjs/amino';
import { fromBase64 } from '@cosmjs/encoding';
import { JwtService } from '@nestjs/jwt';
import { CustomError } from 'src/common/customError';
import { encodeSecp256k1Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import { isNumberString } from 'class-validator';
import {
  AppConstants,
  COMMON_CONSTANTS,
} from 'src/common/constants/app.constant';
import { ContextService } from 'providers/context.service';
import { IGeneralRepository } from 'src/repositories';
@Injectable()
export class AuthService implements IAuthService {
  private readonly _logger = new Logger(AuthService.name);
  private static _authUserKey = AppConstants.USER_KEY;

  constructor(
    private configService: ConfigService = new ConfigService(),
    private jwtService: JwtService,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private chainRepo: IGeneralRepository,
  ) {
    this._logger.log('============== Constructor Auth Service ==============');
  }
  async auth(request: MODULE_REQUEST.AuthRequest): Promise<ResponseDto> {
    try {
      const { pubkey, data, signature, internalChainId } = request;

      // validate input
      if (!COMMON_CONSTANTS.REGEX_BASE64.test(pubkey)) {
        throw new CustomError(ErrorMap.PUBKEY_NOT_BASE64);
      }
      if (!COMMON_CONSTANTS.REGEX_BASE64.test(signature)) {
        throw new CustomError(ErrorMap.SIGNATURE_NOT_BASE64);
      }
      if (!isNumberString(data) || !(new Date(Number(data)).getTime() > 0)) {
        throw new CustomError(ErrorMap.INVALID_TIMESTAMP);
      }

      // Find chain
      const chainInfo = await this.chainRepo.findChain(internalChainId);
      const prefix = chainInfo.prefix;

      // get address from pubkey
      const pubkeyFormated = encodeSecp256k1Pubkey(fromBase64(pubkey));
      const address = pubkeyToAddress(pubkeyFormated, prefix);

      // create message hash from data
      const msg = this.createSignMessageByData(address, data);
      const msgHash = sha256(serializeSignDoc(msg));
      const pubKeyUint8 = fromBase64(pubkey);

      // verify signature
      const resultVerify = await Secp256k1.verifySignature(
        Secp256k1Signature.fromFixedLength(fromBase64(signature)),
        msgHash,
        pubKeyUint8,
      );

      if (!resultVerify) {
        throw new CustomError(ErrorMap.UNAUTHRORIZED);
      }

      const payload = {
        address: address,
        pubkey: pubkey,
        data: data,
        signature: signature,
      };
      const accessToken = this.jwtService.sign(payload);

      return ResponseDto.response(ErrorMap.SUCCESSFUL, {
        AccessToken: `${accessToken}`,
      });
    } catch (error) {
      return ResponseDto.responseError(AuthService.name, error);
    }
  }

  createSignMessageByData(address: string, data: string) {
    const signDoc = {
      chain_id: '',
      account_number: '0',
      sequence: '0',
      fee: {
        gas: '0',
        amount: [],
      },
      msgs: [
        {
          type: 'sign/MsgSignData',
          value: {
            signer: address,
            data: Buffer.from(data, 'utf8').toString('base64'),
          },
        },
      ],
      memo: '',
    };
    return signDoc;
  }

  static getAuthUser() {
    return ContextService.get(AuthService._authUserKey);
  }

  static setAuthUser(user) {
    ContextService.set(AuthService._authUserKey, user);
  }
}
