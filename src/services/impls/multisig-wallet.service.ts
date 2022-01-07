import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { ConfigService } from 'src/shared/services/config.service';
import { IMultisigWalletService } from '../imultisig-wallet.service';
import { IMultisigWalletRepository } from 'src/repositories/imultisig-wallet.repository';
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
import { BaseService } from './base.service';
import { GetMultisigWalletResponse } from 'src/dtos/responses/multisig-wallet/get-multisig-wallet.response';
@Injectable()
export class MultisigWalletService
  extends BaseService
  implements IMultisigWalletService
{
  private readonly _logger = new Logger(MultisigWalletService.name);
  private _commonUtil: CommonUtil = new CommonUtil();
  constructor(
    private configService: ConfigService = new ConfigService(),
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
    private repos: IMultisigWalletRepository,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Multisig Wallet Service ==============',
    );
  }

  async createMultisigWallet(
    request: MODULE_REQUEST.CreateMultisigWalletRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
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
      safe.safe_address = multiSigWalletAddress;
      safe.pubkey = JSON.stringify(multisigPubkey);
      safe.threshold = threshold;
      safe.owner_address = this._commonUtil.pubkeyToAddress(pubkey);
      const checkSafe = await this.repos.findByCondition({
        safe_address: safe.safe_address,
        owner_address: safe.owner_address,
      });
      if (checkSafe.length > 0) {
        return res.return(ErrorMap.EXISTS, {});
      }
      this.repos.create(safe);
    }
    return res.return(ErrorMap.SUCCESSFUL, result);
  }

  createPubkeys(value: string): SinglePubkey {
    const result: SinglePubkey = {
      type: 'tendermint/PubKeySecp256k1',
      value,
    };
    return result;
  }

  async getMultisigWallet(address: string): Promise<ResponseDto> {
    const res = new ResponseDto();
    const safes = await this.repos.findByCondition({
      address: address,
    });

    if (safes && safes.length === 0) {
      return res.return(ErrorMap.NOTFOUND);
    }

    const owners = safes.map((safe) => {
      return safe.owner;
    });

    const safeInfo = new GetMultisigWalletResponse();
    safeInfo.address = safes[0].address;
    safeInfo.pubkeys = safes[0].pubkeys;
    safeInfo.owners = owners;
    safeInfo.threshold = safes[0].threshold;

    return res.return(ErrorMap.SUCCESSFUL, safeInfo);
  }

  async getMultisigWalletsByOwner(ownerAddress: string): Promise<ResponseDto> {
    const res = new ResponseDto();
    const result = await this.repos.findByCondition({
      address: ownerAddress,
    });
    if (result) {
      const safes = result.map((s) => {
        return s.address;
      });
      return res.return(ErrorMap.SUCCESSFUL, { safes });
    }
    return res.return(ErrorMap.NOTFOUND);
  }

  async connectMultisigWalletByAddress(request: MODULE_REQUEST.ConnectMultisigWalletRequest): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500);
    }
  }
}
