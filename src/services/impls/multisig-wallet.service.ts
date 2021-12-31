import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { ConfigService } from 'src/shared/services/config.service';
import { IMultisigWalletService } from '../imultisig-wallet.service';
import { ISafeRepository } from 'src/repositories/isafe.repository';
import {
  createMultisigThresholdPubkey,
  Pubkey,
  SinglePubkey,
} from '@cosmjs/amino';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import {
  ENTITIES_CONFIG,
  MODULE_REQUEST,
  REPOSITORY_INTERFACE,
} from 'src/module.config';
import { CommonUtil } from 'src/utils/common.util';
@Injectable()
export class MultisigWalletService implements IMultisigWalletService {
  private readonly _logger = new Logger(MultisigWalletService.name);
  private _commonUtil: CommonUtil = new CommonUtil();
  constructor(
    private configService: ConfigService = new ConfigService(),
    @Inject(REPOSITORY_INTERFACE.ISAFE_REPOSITORY)
    private _safeRepos: ISafeRepository,
  ) {
    this._logger.log(
      '============== Constructor Multisig Wallet Service ==============',
    );
  }
  async createMultisigWallet(
    request: MODULE_REQUEST.CreateMultisigWalletRequest,
  ): Promise<ResponseDto> {
    const { threshold, pubkeys } = request;

    const arrPubkeys = pubkeys.map(this.createPubkeys);

    const multisigPubkey = createMultisigThresholdPubkey(arrPubkeys, threshold);
    const multiSigWalletAddress =
      this._commonUtil.pubkeyToAddress(multisigPubkey);
    let result = {
      pubkey: JSON.stringify(multisigPubkey),
      address: multiSigWalletAddress,
    };

    for (const pubkey of arrPubkeys) {
      const safe = new ENTITIES_CONFIG.SAFE();
      safe.address = multiSigWalletAddress;
      safe.pubkey = JSON.stringify(multisigPubkey);
      safe.threshold = threshold;
      safe.owner = this._commonUtil.pubkeyToAddress(pubkey);
      this._safeRepos.create(safe);
    }

    const res = new ResponseDto();
    return res.return(ErrorMap.SUCCESSFUL.Code, result);
  }

  createPubkeys(value: string): SinglePubkey {
    const result: SinglePubkey = {
      type: 'tendermint/PubKeySecp256k1',
      value,
    };
    return result;
  }
}
