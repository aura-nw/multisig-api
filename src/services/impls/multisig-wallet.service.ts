import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
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
import { createMultisigThresholdPubkey, SinglePubkey } from '@cosmjs/amino';
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
  private defaultInternalChainId: number;
  private _commonUtil: CommonUtil = new CommonUtil();

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
    this.defaultInternalChainId = Number(this.configService.get('CHAIN_ID'));
  }

  // async connectMultisigWalletByAddress(
  //   request: MODULE_REQUEST.ConnectMultisigWalletRequest,
  // ): Promise<ResponseDto> {
  //   const res = new ResponseDto();
  //   try {
  //     let ownerMultisig = await this.safeRepo.checkOwnerMultisigWallet(
  //       request.owner_address,
  //       request.safe_address,
  //       request.chainId,
  //     );

  //     return res.return(ErrorMap.SUCCESSFUL, ownerMultisig);
  //   } catch (error) {
  //     this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
  //     this._logger.error(`${error.name}: ${error.message}`);
  //     this._logger.error(`${error.stack}`);
  //     return res.return(ErrorMap.E500);
  //   }
  // }

  async createMultisigWallet(
    request: MODULE_REQUEST.CreateMultisigWalletRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const { creatorAddress, creatorPubkey, threshold, internalChainId } =
        request;
      let { otherOwnersAddress } = request;

      // Check input
      if (otherOwnersAddress.indexOf(creatorAddress) > -1)
        return res.return(ErrorMap.OTHER_ADDRESS_INCLUDE_CREATOR);
      if (this._commonUtil.checkIfDuplicateExists(otherOwnersAddress))
        return res.return(ErrorMap.DUPLICATE_SAFE_OWNER);
      const chainInfo = (await this.generalRepo.findOne(
        internalChainId,
      )) as Chain;
      if (!chainInfo) return res.return(ErrorMap.CHAIN_ID_NOT_EXIST);

      // Filter empty string in otherOwnersAddress
      otherOwnersAddress =
        this._commonUtil.filterEmptyInStringArray(otherOwnersAddress);

      // insert safe
      const safe = new ENTITIES_CONFIG.SAFE();
      safe.creatorAddress = creatorAddress;
      safe.creatorPubkey = creatorPubkey;
      safe.threshold = threshold;
      safe.internalChainId = internalChainId;

      // check duplicate with safe address hash
      const { existInDB, safeAddressHash } = await this.makeAddressHash(
        safe.internalChainId,
        [creatorAddress, ...otherOwnersAddress],
        threshold,
      );
      if (existInDB) return res.return(ErrorMap.DUPLICATE_SAFE_ADDRESS_HASH);
      safe.addressHash = safeAddressHash;

      // check if need create safe address
      if (otherOwnersAddress.length === 0) {
        try {
          const safeInfo = this.createSafeAddressAndPubkey(
            [creatorPubkey],
            threshold,
            chainInfo.prefix,
          );

          safe.safeAddress = safeInfo.address;
          safe.safePubkey = safeInfo.pubkey;
          safe.status = SAFE_STATUS.CREATED;
        } catch (error) {
          return res.return(ErrorMap.CANNOT_CREATE_SAFE_ADDRESS, error.message);
        }
      } else {
        safe.status = SAFE_STATUS.PENDING;
      }

      // insert
      const result = await this.insertSafe(safe);
      if (result.error !== ErrorMap.SUCCESSFUL) {
        return res.return(result.error, result.errorMsg);
      }
      const safeId = result.safe?.id;

      // insert safe_creator
      const safeCreator = new ENTITIES_CONFIG.SAFE_OWNER();
      safeCreator.ownerAddress = creatorAddress;
      safeCreator.ownerPubkey = creatorPubkey;
      safeCreator.safeId = safeId;
      safeCreator.internalChainId = internalChainId;
      try {
        await this.safeOwnerRepo.create(safeCreator);
      } catch (err) {
        return res.return(ErrorMap.INSERT_SAFE_OWNER_FAILED, err.message);
      }

      // TODO: bulk insert safe creator and all safe owners
      // insert safe_owner
      for (const ownerAddress of otherOwnersAddress) {
        const safeOwner = new ENTITIES_CONFIG.SAFE_OWNER();
        safeOwner.ownerAddress = ownerAddress;
        safeOwner.safeId = safeId;
        safeOwner.internalChainId = internalChainId;
        try {
          await this.safeOwnerRepo.create(safeOwner);
        } catch (err) {
          return res.return(ErrorMap.INSERT_SAFE_OWNER_FAILED, err.message);
        }
      }

      return res.return(ErrorMap.SUCCESSFUL, safe);
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500, error.message);
    }
  }

  async getMultisigWallet(
    param: MODULE_REQUEST.GetSafePathParams,
    query: MODULE_REQUEST.GetSafeQuery,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const { safeId } = param;
      const { internalChainId } = query;
      // build search condition
      let condition = this.calculateCondition(safeId, internalChainId);

      // find safes
      const safes = await this.safeRepo.findByCondition(condition);
      if (!safes || safes.length === 0) {
        this._logger.debug(
          `Not found any safe with condition: ${JSON.stringify(condition)}`,
        );
        return res.return(ErrorMap.NO_SAFES_FOUND);
      }
      const safe = safes[0];

      // find safe owner
      const owners = (await this.safeOwnerRepo.findByCondition({
        safeId: safe.id,
      })) as SafeOwner[];
      if (!owners || owners.length === 0) {
        this._logger.debug(
          `Not found any safe owner with safeId: ${safeId} and internalChainId: ${internalChainId}`,
        );
        return res.return(ErrorMap.NO_SAFE_OWNERS_FOUND);
      }

      // get confirm list
      const confirms = owners.filter(({ ownerPubkey }) => ownerPubkey !== null);

      // build safe info
      const safeInfo = new GetMultisigWalletResponse();
      safeInfo.id = safe.id;
      safeInfo.address = safe.safeAddress;
      safeInfo.pubkeys = safe.safePubkey;
      safeInfo.owners = owners.map((o) => o.ownerAddress);
      safeInfo.confirms = confirms.map((o) => o.ownerAddress);
      safeInfo.threshold = safe.threshold;
      safeInfo.status = safe.status;
      safeInfo.internalChainId = safe.internalChainId;

      // get chainInfo
      const chainInfo = (await this.generalRepo.findOne(
        safeInfo.internalChainId,
      )) as Chain;
      if (!chainInfo) return res.return(ErrorMap.CHAIN_ID_NOT_EXIST);

      // if safe created => Get balance
      if (safeInfo.address !== null) {
        try {
          const network = new Network(chainInfo.rpc);
          await network.init();
          const balance = await network.getBalance(
            safeInfo.address,
            chainInfo.denom,
          );
          safeInfo.balance = [balance];
        } catch (error) {
          return res.return(ErrorMap.GET_BALANCE_FAILED, error.message);
        }
      }
      return res.return(ErrorMap.SUCCESSFUL, safeInfo);
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500, error.message);
    }
  }

  async getBalance(
    param: MODULE_REQUEST.GetSafeBalancePathParams,
    query: MODULE_REQUEST.GetSafeBalanceQuery,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const { safeId } = param;
      const { internalChainId } = query;
      // build search condition
      const condition = this.calculateCondition(safeId, internalChainId);

      // find safes
      const safes = await this.safeRepo.findByCondition(condition);
      if (!safes || safes.length === 0) {
        this._logger.debug(
          `Not found any safe with condition: ${JSON.stringify(condition)}`,
        );
        return res.return(ErrorMap.NO_SAFES_FOUND);
      }
      const safe = safes[0];

      if (!safe.safeAddress || safe.safeAddress === null) {
        // cannot get balance because safe address is null
        return res.return(ErrorMap.SAFE_ADDRESS_IS_NULL);
      }
      // get chainInfo
      const chainInfo = (await this.generalRepo.findOne(
        safe.internalChainId,
      )) as Chain;
      if (!chainInfo) return res.return(ErrorMap.CHAIN_ID_NOT_EXIST);

      try {
        const network = new Network(chainInfo.rpc);
        await network.init();
        const balance = await network.getBalance(
          safe.safeAddress,
          chainInfo.denom,
        );
        return res.return(ErrorMap.SUCCESSFUL, [balance]);
      } catch (error) {
        return res.return(ErrorMap.GET_BALANCE_FAILED, error.message);
      }
    } catch (error) {
      console.log(error);
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500, error.message);
    }
  }

  async confirm(
    param: MODULE_REQUEST.ConfirmSafePathParams,
    request: MODULE_REQUEST.ConfirmMultisigWalletRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const { safeId } = param;
      const { myAddress, myPubkey } = request;
      const condition = this.calculateCondition(safeId);
      // find safe
      const safes = (await this.safeRepo.findByCondition(condition)) as Safe[];
      if (!safes || safes.length === 0)
        return res.return(ErrorMap.NO_SAFES_FOUND);
      const safe = safes[0];

      // check safe
      if (safe.status !== SAFE_STATUS.PENDING)
        return res.return(ErrorMap.SAFE_NOT_PENDING);

      // get safe owners
      const safeOwners = (await this.safeOwnerRepo.findByCondition({
        safeId: safe.id,
      })) as SafeOwner[];
      if (safeOwners.length === 0)
        return res.return(ErrorMap.NO_SAFE_OWNERS_FOUND);

      // get safe owner by address
      const index = safeOwners.findIndex((s) => s.ownerAddress === myAddress);
      // const safeOwner = safeOwners[safeOwnerIndex];
      if (index === -1)
        return res.return(ErrorMap.SAFE_OWNERS_NOT_INCLUDE_ADDRESS);
      if (safeOwners[index].ownerPubkey !== null)
        return res.return(ErrorMap.SAFE_OWNER_PUBKEY_NOT_EMPTY);

      // update safe owner
      safeOwners[index].ownerPubkey = myPubkey;
      const updateResult = await this.safeOwnerRepo.update(safeOwners[index]);
      if (!updateResult)
        return res.return(ErrorMap.UPDATE_SAFE_OWNER_FAILED, {});

      // check all owner confirmed
      const notReady = safeOwners.findIndex((s) => s.ownerPubkey === null);
      if (notReady !== -1) return res.return(ErrorMap.SUCCESSFUL, safe);

      // calculate owner pubKey array
      const pubkeys = safeOwners.map((s) => {
        return s.ownerAddress === myAddress ? myPubkey : s.ownerPubkey;
      });

      // generate safe address and pubkey
      const chainInfo = (await this.generalRepo.findOne(
        safe.internalChainId,
      )) as Chain;
      if (!chainInfo) return res.return(ErrorMap.CHAIN_ID_NOT_EXIST);

      try {
        const safeInfo = this.createSafeAddressAndPubkey(
          pubkeys,
          safe.threshold,
          chainInfo.prefix,
        );
        safe.safeAddress = safeInfo.address;
        safe.safePubkey = safeInfo.pubkey;
        safe.status = SAFE_STATUS.CREATED;
      } catch (error) {
        return res.return(ErrorMap.CANNOT_CREATE_SAFE_ADDRESS, error.message);
      }
      // update safe
      await this.safeRepo.update(safe);
      return res.return(ErrorMap.SUCCESSFUL, safe);
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500, error.message);
    }
  }

  async deletePending(
    param: MODULE_REQUEST.DeleteSafePathParams,
    request: MODULE_REQUEST.DeleteMultisigWalletRequest,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const { safeId } = param;
      const { myAddress } = request;
      const condition = this.calculateCondition(safeId);

      // get safe & check
      const safes = await this.safeRepo.findByCondition(condition);
      if (safes.length === 0) return res.return(ErrorMap.NO_SAFES_FOUND);
      const safe = safes[0] as Safe;
      if (safe.creatorAddress !== myAddress)
        return res.return(ErrorMap.ADDRESS_NOT_CREATOR);
      if (safe.status !== SAFE_STATUS.PENDING)
        return res.return(ErrorMap.SAFE_NOT_PENDING);

      // update status pending => deleted
      safe.status = SAFE_STATUS.DELETED;

      await this.safeRepo.update(safe);
      return res.return(ErrorMap.SUCCESSFUL, {});
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500, error.message);
    }
  }

  async getMultisigWalletsByOwner(
    param: MODULE_REQUEST.GetSafesByOwnerAddressParams,
    // query: MODULE_REQUEST.GetSafesByOwnerAddressQuery,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const { address, internalChainId } = param;
      // const { internalChainId } = query;
      const result = await this.safeRepo.getMultisigWalletsByOwner(
        address,
        internalChainId,
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
      return res.return(ErrorMap.SUCCESSFUL, response);
    } catch (error) {
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return res.return(ErrorMap.E500, error.message);
    }
  }

  private calculateCondition(safeId: string, internalChainId?: number) {
    return isNaN(Number(safeId))
      ? {
        safeAddress: safeId,
        internalChainId: internalChainId || this.defaultInternalChainId || '',
      }
      : {
        id: safeId,
      };
  }

  async insertSafe(safe: any): Promise<{
    error: typeof ErrorMap.SUCCESSFUL;
    safe?: any;
    errorMsg?: string;
  }> {
    // Unnecessary because it is already checked for duplicates by safe address hash
    // const checkSafe = await this.safeRepo.findByCondition({
    //   safeAddress: safe.safeAddress,
    // });
    // if (checkSafe && checkSafe.length > 0) {
    //   return { error: ErrorMap.EXISTS };
    // }
    try {
      const result = await this.safeRepo.create(safe);
      return { error: ErrorMap.SUCCESSFUL, safe: result };
    } catch (err) {
      return {
        error: ErrorMap.INSERT_SAFE_FAILED,
        safe: {},
        errorMsg: err.message,
      };
    }
  }

  private createSafeAddressAndPubkey(
    pubKeyArrString: string[],
    threshold: number,
    prefix: string,
  ): {
    pubkey: string;
    address: string;
  } {
    const arrPubkeys = pubKeyArrString.map(this.createPubkeys);
    const multisigPubkey = createMultisigThresholdPubkey(arrPubkeys, threshold);
    const multiSigWalletAddress = this._commonUtil.pubkeyToAddress(
      multisigPubkey,
      prefix,
    );
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

  private async makeAddressHash(
    internalChainId: number,
    addresses: string[],
    threshold: number,
  ) {
    const safeAddress = {
      addresses: addresses.sort(),
      threshold,
      internalChainId,
    };
    const safeAddressHash = createHash('sha256')
      .update(JSON.stringify(safeAddress))
      .digest('base64');
    const existSafe = await this.safeRepo.findByCondition(
      {
        addressHash: safeAddressHash,
      },
      null,
      ['id', 'addressHash', 'status'],
    );
    // filter deleted status
    if (existSafe && existSafe.length > 0) {
      const existList = existSafe.filter(
        (safe) => safe.status !== SAFE_STATUS.DELETED,
      );
      if (existList && existList.length > 0) {
        this._logger.debug(`Safe with these information already exists!`);
        return {
          existInDB: true,
          safeAddressHash,
        };
      }
    }
    return {
      existInDB: false,
      safeAddressHash,
    };
  }
}
