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
import { CustomError } from 'src/common/customError';
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
    private safeOwnerRepo: IMultisigWalletOwnerRepository,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private generalRepo: IGeneralRepository,
  ) {
    super(safeRepo);
    this._logger.log(
      '============== Constructor Multisig Wallet Service ==============',
    );
  }

  async createMultisigWallet(
    request: MODULE_REQUEST.CreateMultisigWalletRequest,
  ): Promise<ResponseDto> {
    try {
      const { creatorAddress, creatorPubkey, threshold, internalChainId } =
        request;
      let { otherOwnersAddress } = request;

      // Check input
      if (otherOwnersAddress.indexOf(creatorAddress) > -1)
        throw new CustomError(ErrorMap.OTHER_ADDRESS_INCLUDE_CREATOR);
      if (this._commonUtil.checkIfDuplicateExists(otherOwnersAddress))
        throw new CustomError(ErrorMap.DUPLICATE_SAFE_OWNER);

      // Find chain
      const chainInfo = await this.generalRepo.findChain(internalChainId);

      // Filter empty string in otherOwnersAddress
      otherOwnersAddress =
        this._commonUtil.filterEmptyInStringArray(otherOwnersAddress);

      // insert safe
      const result = await this.safeRepo.insertSafe(
        creatorAddress,
        creatorPubkey,
        otherOwnersAddress,
        threshold,
        internalChainId,
        chainInfo.prefix,
      );
      const safeId = result.id;

      // insert safe_creator
      await this.safeOwnerRepo.insertOwners(
        safeId,
        internalChainId,
        creatorAddress,
        creatorPubkey,
        otherOwnersAddress,
      );

      return ResponseDto.response(ErrorMap.SUCCESSFUL, result);
    } catch (error) {
      if (error instanceof CustomError)
        return ResponseDto.response(error.errorMap, error.msg);
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return ResponseDto.response(ErrorMap.E500, error.message);
    }
  }

  async getMultisigWallet(
    param: MODULE_REQUEST.GetSafePathParams,
    query: MODULE_REQUEST.GetSafeQuery,
  ): Promise<ResponseDto> {
    try {
      const { safeId } = param;
      const { internalChainId } = query;
      const safe = await this.safeRepo.getSafe(safeId, internalChainId);

      // find safe owner
      const owners = await this.safeOwnerRepo.getSafeOwnersWithError(safe.id);

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
      const chainInfo = await this.generalRepo.findChain(internalChainId);

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
          throw new CustomError(ErrorMap.GET_BALANCE_FAILED, error.message);
        }
      }
      return ResponseDto.response(ErrorMap.SUCCESSFUL, safeInfo);
    } catch (error) {
      if (error instanceof CustomError)
        return ResponseDto.response(error.errorMap, error.msg);
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return ResponseDto.response(ErrorMap.E500, error.message);
    }
  }

  async getBalance(
    param: MODULE_REQUEST.GetSafeBalancePathParams,
    query: MODULE_REQUEST.GetSafeBalanceQuery,
  ): Promise<ResponseDto> {
    try {
      const { safeId } = param;
      const { internalChainId } = query;

      // find safes
      const safe = await this.safeRepo.getSafe(safeId, internalChainId);

      if (!safe.safeAddress || safe.safeAddress === null) {
        // cannot get balance because safe address is null
        throw new CustomError(ErrorMap.SAFE_ADDRESS_IS_NULL);
      }
      // get chainInfo
      const chainInfo = await this.generalRepo.findChain(internalChainId);

      try {
        const network = new Network(chainInfo.rpc);
        await network.init();
        const balance = await network.getBalance(
          safe.safeAddress,
          chainInfo.denom,
        );
        return ResponseDto.response(ErrorMap.SUCCESSFUL, [balance]);
      } catch (error) {
        throw new CustomError(ErrorMap.GET_BALANCE_FAILED, error.message);
      }
    } catch (error) {
      if (error instanceof CustomError)
        return ResponseDto.response(error.errorMap, error.msg);
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return ResponseDto.response(ErrorMap.E500, error.message);
    }
  }

  async confirm(
    param: MODULE_REQUEST.ConfirmSafePathParams,
    request: MODULE_REQUEST.ConfirmMultisigWalletRequest,
  ): Promise<ResponseDto> {
    try {
      const { safeId } = param;
      const { myAddress, myPubkey } = request;

      // find safe
      const safe = await this.safeRepo.getPendingSafe(safeId);

      // get confirm status
      const { safeOwner, fullConfirmed, pubkeys } =
        await this.safeOwnerRepo.getConfirmSafeStatus(
          safeId,
          myAddress,
          myPubkey,
        );

      // update safe owner
      await this.safeOwnerRepo.updateSafeOwner(safeOwner);

      if (!fullConfirmed)
        return ResponseDto.response(ErrorMap.SUCCESSFUL, safe);

      // get chainInfo
      const chainInfo = await this.generalRepo.findChain(safe.internalChainId);

      const result = await this.safeRepo.confirmSafe(
        safe,
        pubkeys,
        chainInfo.prefix,
      );
      return ResponseDto.response(ErrorMap.SUCCESSFUL, result);
    } catch (error) {
      if (error instanceof CustomError)
        return ResponseDto.response(error.errorMap, error.msg);
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return ResponseDto.response(ErrorMap.E500, error.message);
    }
  }

  async deletePending(
    param: MODULE_REQUEST.DeleteSafePathParams,
    request: MODULE_REQUEST.DeleteMultisigWalletRequest,
  ): Promise<ResponseDto> {
    try {
      const { safeId } = param;
      const { myAddress } = request;

      const deletedSafe = await this.safeRepo.deletePendingSafe(
        safeId,
        myAddress,
      );
      return ResponseDto.response(ErrorMap.SUCCESSFUL, deletedSafe);
    } catch (error) {
      if (error instanceof CustomError)
        return ResponseDto.response(error.errorMap, error.msg);
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return ResponseDto.response(ErrorMap.E500, error.message);
    }
  }

  async getMultisigWalletsByOwner(
    param: MODULE_REQUEST.GetSafesByOwnerAddressParams,
    query: MODULE_REQUEST.GetSafesByOwnerAddressQuery,
  ): Promise<ResponseDto> {
    try {
      const { address } = param;
      const { internalChainId } = query;
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
      return ResponseDto.response(ErrorMap.SUCCESSFUL, response);
    } catch (error) {
      if (error instanceof CustomError)
        return ResponseDto.response(error.errorMap, error.msg);
      this._logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);
      this._logger.error(`${error.name}: ${error.message}`);
      this._logger.error(`${error.stack}`);
      return ResponseDto.response(ErrorMap.E500, error.message);
    }
  }
}
