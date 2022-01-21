import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { ConfigService } from 'src/shared/services/config.service';
import { IMultisigWalletService } from '../imultisig-wallet.service';
import { IMultisigWalletRepository } from 'src/repositories/imultisig-wallet.repository';
import { IMultisigWalletOwnerRepository } from 'src/repositories/imultisig-wallet-owner.repository';
import {
  SAFE_OWNER_STATUS,
  SAFE_STATUS,
} from 'src/common/constants/app.constant';
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
import { Network } from 'src/utils/network.utils';
import { BaseService } from './base.service';
import { GetMultisigWalletResponse } from 'src/dtos/responses/multisig-wallet/get-multisig-wallet.response';
import { Safe } from 'src/entities/safe.entity';
import { SafeOwner } from 'src/entities/safe-owner.entity';
import { plainToInstance } from 'class-transformer';
import { ListSafeByOwnerResponse } from 'src/dtos/responses/multisig-wallet/get-safe-by-owner.response';
import { IGeneralRepository } from 'src/repositories/igeneral.repository';
import { Chain } from 'src/entities';
@Injectable()
export class MultisigWalletService
  extends BaseService
  implements IMultisigWalletService {
  private readonly _logger = new Logger(MultisigWalletService.name);
  private _commonUtil: CommonUtil = new CommonUtil();
  private defaultChainId: number;
  constructor(
    private configService: ConfigService = new ConfigService(),
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
    private safeRepo: IMultisigWalletRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_OWNER_REPOSITORY)
    private safeOwnerRepo: IMultisigWalletOwnerRepository, //
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private generalRepo: IGeneralRepository, //
  ) {
    super(safeRepo);
    this._logger.log(
      '============== Constructor Multisig Wallet Service ==============',
    );
    this.defaultChainId = Number(this.configService.get('CHAIN_ID'));
  }

  async connectMultisigWalletByAddress(
    request: MODULE_REQUEST.ConnectMultisigWalletRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      let ownerMultisig = await this.safeRepo.checkOwnerMultisigWallet(
        request.owner_address,
        request.safe_address,
        request.chainId,
      );

      return res.return(ErrorMap.SUCCESSFUL, ownerMultisig);
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500);
    }
  }

  async createMultisigWallet(
    request: MODULE_REQUEST.CreateMultisigWalletRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    const { creatorAddress, creatorPubkey, otherOwnersAddress, threshold } =
      request;
    const chainId = request.chainId || this.defaultChainId;

    // Check input
    if (otherOwnersAddress.indexOf(creatorAddress) > -1)
      return res.return(ErrorMap.OTHER_ADDRESS_INCLUDE_CREATOR);
    if (this._commonUtil.checkIfDuplicateExists(otherOwnersAddress))
      return res.return(ErrorMap.DUPLICATE_SAFE_OWNER);
    const chainInfo = (await this.generalRepo.findOne(chainId)) as Chain;
    if (!chainInfo) return res.return(ErrorMap.CHAIN_ID_NOT_EXIST);
    console.log(chainInfo);
    console.log(chainId);

    // TODO: check duplicate
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
    safe.chainId = chainId;
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
    safeCreator.chainId = chainId;
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
      safeOwner.chainId = chainId;
      try {
        await this.safeOwnerRepo.create(safeOwner);
      } catch (err) {
        return res.return(ErrorMap.SOMETHING_WENT_WRONG, {});
      }
    }

    return res.return(ErrorMap.SUCCESSFUL, safe);
  }

  async getMultisigWallet(
    safeId: string,
    chainId = this.defaultChainId,
  ): Promise<ResponseDto> {
    // build search condition
    let condition = this.calculateCondition(safeId, chainId);
    console.log(condition);

    // find safes
    const res = new ResponseDto();
    const safes = await this.safeRepo.findByCondition(condition);
    if (!safes || safes.length === 0) {
      this._logger.debug(
        `Not found any safe with condition: ${JSON.stringify(condition)}`,
      );
      return res.return(ErrorMap.NOTFOUND);
    }
    const safe = safes[0];

    // find safe owner
    const owners = (await this.safeOwnerRepo.findByCondition({
      safeId: safe.id,
    })) as SafeOwner[];
    if (!owners || owners.length === 0) {
      this._logger.debug(
        `Not found any safe owner with safeId: ${safeId} and chainId: ${chainId}`,
      );
      return res.return(ErrorMap.NOTFOUND);
    }

    // get confirm list
    const confirms = owners.filter(({ ownerPubkey }) => ownerPubkey !== null);

    // build safe info
    const safeInfo = new GetMultisigWalletResponse();
    safeInfo.address = safe.safeAddress;
    safeInfo.pubkeys = safe.safePubkey;
    safeInfo.owners = owners.map((o) => o.ownerAddress);
    safeInfo.confirms = confirms.map((o) => o.ownerAddress);
    safeInfo.threshold = safe.threshold;
    safeInfo.status = safe.status;
    safeInfo.chainId = safe.chainId;

    // get chainInfo
    const chainInfo = (await this.generalRepo.findOne(safeInfo.chainId)) as Chain;

    // if safe created => Get balance
    if (safeInfo.address !== null) {
      const network = new Network(chainInfo.rpc);
      await network.init();
      // const balance = await client.getBalance('aura1cq8k74zcpe0jscja4x4el5su65vt8ela7esj6r');
      const balance = await network.getBalance(safeInfo.address);
      safeInfo.balance = balance;
    }
    return res.return(ErrorMap.SUCCESSFUL, safeInfo);
  }

  async confirm(
    safeId: string,
    request: MODULE_REQUEST.ConfirmMultisigWalletRequest,
    chainId = this.defaultChainId,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    const { myAddress, myPubkey } = request;
    const condition = this.calculateCondition(safeId, chainId);
    try {
      // find safe
      const safes = (await this.safeRepo.findByCondition(condition)) as Safe[];
      if (!safes || safes.length === 0) return res.return(ErrorMap.NOTFOUND);
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
      const index = safeOwners.findIndex((s) => s.ownerAddress === myAddress);
      // const safeOwner = safeOwners[safeOwnerIndex];
      if (index === -1) return res.return(ErrorMap.NOTFOUND);
      if (safeOwners[index].ownerPubkey !== null)
        return res.return(ErrorMap.SAFE_OWNER_PUBKEY_NOT_EMPTY);

      // update safe owner
      safeOwners[index].ownerPubkey = myPubkey;
      const updateResult = await this.safeOwnerRepo.update(safeOwners[index]);
      if (!updateResult) return res.return(ErrorMap.SOMETHING_WENT_WRONG, {});

      // check all owner confirmed
      const notReady = safeOwners.findIndex((s) => s.ownerPubkey === null);
      if (notReady !== -1) return res.return(ErrorMap.SUCCESSFUL, updateResult);

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
    chainId = this.defaultChainId,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    const { myAddress } = request;
    const condition = this.calculateCondition(safeId, chainId);

    // get safe & check
    const safes = await this.safeRepo.findByCondition(condition);
    if (safes.length === 0) return res.return(ErrorMap.NOTFOUND);
    const safe = safes[0] as Safe;
    if (safe.creatorAddress !== myAddress)
      return res.return(ErrorMap.ADDRESS_NOT_CREATOR);
    if (safe.status !== SAFE_STATUS.PENDING)
      return res.return(ErrorMap.SAFE_NOT_PENDING);

    // update status pending => deleted
    safe.status = SAFE_STATUS.DELETED;

    try {
      await this.safeRepo.update(safe);
      return res.return(ErrorMap.SUCCESSFUL, {});
    } catch (err) {
      this._logger.error(err);
      return res.return(ErrorMap.SOMETHING_WENT_WRONG);
    }
  }

  async getMultisigWalletsByOwner(
    ownerAddress: string,
    chainId = this.defaultChainId,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    const result = await this.safeRepo.getMultisigWalletsByOwner(
      ownerAddress,
      chainId,
    );
    const listSafe = plainToInstance(ListSafeByOwnerResponse, result);
    const response = listSafe.map((res) => {
      if (
        res.status === SAFE_STATUS.PENDING &&
        res.creatorAddress !== res.ownerAddress
      ) {
        res.status =
          res.ownerPubkey === null
            ? SAFE_OWNER_STATUS.NEED_CONFIRM
            : SAFE_OWNER_STATUS.CONFIRMED;
      }
      return res;
    });
    // const groupResult = this._commonUtil.groupBy(result, 'status');
    return res.return(ErrorMap.SUCCESSFUL, response);
  }

  private calculateCondition(safeId: string, chainId?: number) {
    // this.configService.get()
    return isNaN(Number(safeId))
      ? {
        safeAddress: safeId,
        chainId: chainId || this.defaultChainId,
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

  // private makeUniqueKey(addresses: string[], threshold: number) {

  // }
}
