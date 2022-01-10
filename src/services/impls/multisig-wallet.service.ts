import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { ConfigService } from 'src/shared/services/config.service';
import { IMultisigWalletService } from '../imultisig-wallet.service';
import { IMultisigWalletRepository } from 'src/repositories/imultisig-wallet.repository';
import { IMultisigWalletOwnerRepository } from 'src/repositories/imultisig-wallet-owner.repository';
import { SAFE_STATUS } from 'src/common/constants/app.constant';
import {
  createMultisigThresholdPubkey,
  Pubkey,
  SinglePubkey,
} from '@cosmjs/amino';
import {
  ENTITIES_CONFIG,
  MODULE_REQUEST,
  REPOSITORY_INTERFACE,
} from 'src/module.config';
import { CommonUtil } from 'src/utils/common.util';
import { BaseService } from './base.service';
import { GetMultisigWalletResponse } from 'src/dtos/responses/multisig-wallet/get-multisig-wallet.response';
import { Safe } from 'src/entities/safe.entity';
import { SafeOwner } from 'src/entities/safe-owner.entity';
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
    private safeRepo: IMultisigWalletRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_OWNER_REPOSITORY)
    private safeOwnerRepo: IMultisigWalletOwnerRepository, //
  ) {
    super(safeRepo);
    this._logger.log(
      '============== Constructor Multisig Wallet Service ==============',
    );
  }

  async connectMultisigWalletByAddress(
    request: MODULE_REQUEST.ConnectMultisigWalletRequest,
  ): Promise<ResponseDto> {
    throw new Error('Method not implemented.');
  }

  async createMultisigWallet(
    request: MODULE_REQUEST.CreateMultisigWalletRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    const { creatorAddress, creatorPubkey, otherOwnersAddress, threshold } =
      request;

    // insert safe
    const safe = new ENTITIES_CONFIG.SAFE();
    safe.creatorAddress = creatorAddress;
    safe.creatorPubkey = creatorPubkey;
    safe.threshold = threshold;
    if (otherOwnersAddress.length === 0) {
      const safeInfo = this.createSafeAddressAndPubkey(
        [creatorPubkey],
        threshold,
      );
      safe.safeAddress = safeInfo.address;
      safe.safePubkey = safeInfo.pubkey;
      safe.status = SAFE_STATUS.CREATED;
    } else {
      safe.status = SAFE_STATUS.PENDING;
    }
    const result = await this.insertSafe(safe);
    if (result.error !== ErrorMap.SUCCESSFUL) {
      return res.return(result.error, {});
    }
    const safeId = result.safe?.id;

    // insert safe_creator
    const safeCreator = new ENTITIES_CONFIG.SAFE_OWNER();
    safeCreator.ownerAddress = creatorAddress;
    safeCreator.ownerPubkey = creatorPubkey;
    safeCreator.safeId = safeId;
    try {
      await this.safeOwnerRepo.create(safeCreator);
    } catch (err) {
      return res.return(ErrorMap.SOMETHING_WENT_WRONG, {});
    }

    // insert safe_owner
    for (const ownerAddress of otherOwnersAddress) {
      const safeOwner = new ENTITIES_CONFIG.SAFE_OWNER();
      safeOwner.ownerAddress = ownerAddress;
      safeOwner.safeId = safeId;
      try {
        await this.safeOwnerRepo.create(safeOwner);
      } catch (err) {
        return res.return(ErrorMap.SOMETHING_WENT_WRONG, {});
      }
    }

    return res.return(ErrorMap.SUCCESSFUL, safe);
  }

  async getMultisigWallet(safeId: string): Promise<ResponseDto> {
    let condition = this.calculateCondition(safeId);
    const res = new ResponseDto();
    const safes = await this.safeRepo.findByCondition(condition);

    if (safes && safes.length === 0) {
      return res.return(ErrorMap.NOTFOUND);
    }
    const safe = safes[0];

    const owners = await this.safeOwnerRepo.findByCondition({
      safeId: safe.id,
    });

    const safeInfo = new GetMultisigWalletResponse();
    safeInfo.address = safe.safeAddress;
    safeInfo.pubkeys = safe.safePubkey;
    safeInfo.owners = owners.map((o) => o.ownerAddress);
    safeInfo.threshold = safe.threshold;
    safeInfo.status = safe.status;

    return res.return(ErrorMap.SUCCESSFUL, safeInfo);
  }

  async confirm(
    safeId: string,
    request: MODULE_REQUEST.ConfirmMultisigWalletRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    const { myAddress, myPubkey } = request;
    const condition = this.calculateCondition(safeId);
    try {
      // find safe
      const safes = (await this.safeRepo.findByCondition(condition)) as Safe[];
      if (safes.length === 0) return res.return(ErrorMap.NOTFOUND);
      const safe = safes[0];

      // check safe
      if (safe.status !== SAFE_STATUS.PENDING)
        return res.return(ErrorMap.SAFE_NOT_PENDING);

      // get safe owners
      const safeOwners = (await this.safeOwnerRepo.findByCondition({
        safeId: safe.id,
      })) as SafeOwner[];
      if (safeOwners.length === 0) return res.return(ErrorMap.NOTFOUND);

      // get safe owner by address
      const safeOwner = safeOwners.find((s) => s.ownerAddress === myAddress);
      if (!safeOwner) return res.return(ErrorMap.NOTFOUND);
      if (safeOwner.ownerPubkey !== null)
        return res.return(ErrorMap.SAFE_OWNER_PUBKEY_NOT_EMPTY);

      // update safe owner
      safeOwner.ownerPubkey = myPubkey;
      const updateResult = await this.safeOwnerRepo.update(safeOwner);
      if (!updateResult) return res.return(ErrorMap.SOMETHING_WENT_WRONG, {});

      // calculate owner pubKey array
      const pubkeys = safeOwners.map((s) => {
        return s.ownerAddress === myAddress ? myPubkey : s.ownerPubkey;
      });

      // generate safe address and pubkey
      const safeInfo = this.createSafeAddressAndPubkey(pubkeys, safe.threshold);
      safe.safeAddress = safeInfo.address;
      safe.safePubkey = safeInfo.pubkey;
      safe.status = SAFE_STATUS.CREATED;

      // update safe
      const result = this.safeRepo.update(safe);
      return res.return(ErrorMap.SUCCESSFUL, result);
    } catch (err) {
      return res.return(ErrorMap.SOMETHING_WENT_WRONG, {});
    }
  }

  async deletePending(
    safeId: string,
    request: MODULE_REQUEST.DeleteMultisigWalletRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    const { myAddress } = request;
    const condition = this.calculateCondition(safeId);

    // get safe & check
    const safes = await this.safeRepo.findByCondition(condition);
    if (safes.length === 0) return res.return(ErrorMap.NOTFOUND);
    const safe = safes[0] as Safe;
    console.log(safe);
    if (safe.creatorAddress !== myAddress)
      return res.return(ErrorMap.ADDRESS_NOT_CREATOR);
    if (safe.status !== SAFE_STATUS.PENDING)
      return res.return(ErrorMap.SAFE_NOT_PENDING);

    // update status pending => deleted
    safe.status = SAFE_STATUS.DELETED;

    try {
      await this.safeRepo.update(safe);
      res.return(ErrorMap.SUCCESSFUL, {});
    } catch (err) {
      this._logger.error(err);
      return res.return(ErrorMap.SOMETHING_WENT_WRONG);
    }
  }

  async getMultisigWalletsByOwner(ownerAddress: string): Promise<ResponseDto> {
    const res = new ResponseDto();
    const result = await this.safeRepo.getMultisigWalletsByOwner(ownerAddress);
    // const groupResult = this._commonUtil.groupBy(result, 'status');
    return res.return(ErrorMap.SUCCESSFUL, result);
  }

  private calculateCondition(safeId: string) {
    return isNaN(Number(safeId))
      ? {
          safeAddress: safeId,
        }
      : {
          id: safeId,
        };
  }

  private async insertSafe(
    safe: any,
  ): Promise<{ error: typeof ErrorMap.SUCCESSFUL; safe?: any }> {
    const checkSafe = await this.safeRepo.findByCondition({
      safeAddress: safe.safeAddress,
    });
    if (checkSafe.length > 0) {
      return { error: ErrorMap.EXISTS };
    }
    try {
      const result = await this.safeRepo.create(safe);
      return { error: ErrorMap.SUCCESSFUL, safe: result };
    } catch (err) {
      return { error: ErrorMap.SOMETHING_WENT_WRONG };
    }
  }

  private createSafeAddressAndPubkey(
    pubKeyArrString: string[],
    threshold: number,
  ): {
    pubkey: string;
    address: string;
  } {
    const arrPubkeys = pubKeyArrString.map(this.createPubkeys);
    const multisigPubkey = createMultisigThresholdPubkey(arrPubkeys, threshold);
    const multiSigWalletAddress =
      this._commonUtil.pubkeyToAddress(multisigPubkey);
    return {
      pubkey: JSON.stringify(multisigPubkey),
      address: multiSigWalletAddress,
    };
  }

  private createPubkeys(value: string): SinglePubkey {
    const result: SinglePubkey = {
      type: 'tendermint/PubKeySecp256k1',
      value,
    };
    return result;
  }
}
