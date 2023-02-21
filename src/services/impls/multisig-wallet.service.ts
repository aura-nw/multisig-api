import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from '../../dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { IMultisigWalletService } from '../imultisig-wallet.service';
import { IMultisigWalletRepository } from '../../repositories/imultisig-wallet.repository';
import { IMultisigWalletOwnerRepository } from '../../repositories/imultisig-wallet-owner.repository';
import {
  SAFE_OWNER_STATUS,
  SAFE_STATUS,
} from '../../common/constants/app.constant';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { CommonUtil } from '../../utils/common.util';
import { BaseService } from './base.service';
import { GetMultisigWalletResponse } from '../../dtos/responses/multisig-wallet/get-multisig-wallet.response';
import { plainToInstance } from 'class-transformer';
import { ListSafeByOwnerResponse } from '../../dtos/responses/multisig-wallet/get-safe-by-owner.response';
import { IGeneralRepository } from '../../repositories/igeneral.repository';
import { CustomError } from '../../common/customError';
import { Chain } from '../../entities';
import { encodeSecp256k1Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import { fromBase64 } from '@cosmjs/encoding';
import { IndexerClient } from '../../utils/apis/IndexerClient';
import { ConfigService } from '../../shared/services/config.service';
import { INotificationRepository } from '../../repositories/inotification.repository';
import { EthermintHelper } from '../../chains/ethermint/ethermint.helper';

@Injectable()
export class MultisigWalletService
  extends BaseService
  implements IMultisigWalletService
{
  private readonly _logger = new Logger(MultisigWalletService.name);
  private _commonUtil: CommonUtil = new CommonUtil();
  private _indexer = new IndexerClient(this.configService.get('INDEXER_URL'));
  private ethermintHelper = new EthermintHelper();

  constructor(
    private configService: ConfigService,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
    private safeRepo: IMultisigWalletRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_OWNER_REPOSITORY)
    private safeOwnerRepo: IMultisigWalletOwnerRepository,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private generalRepo: IGeneralRepository,
    @Inject(REPOSITORY_INTERFACE.INOTIFICATION_REPOSITORY)
    private notificationRepo: INotificationRepository,
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
      const { threshold, internalChainId } = request;
      let { otherOwnersAddress } = request;

      const authInfo = this._commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;
      const creatorPubkey = authInfo.pubkey;

      // Check input
      if (otherOwnersAddress.indexOf(creatorAddress) > -1)
        throw new CustomError(ErrorMap.OTHER_ADDRESS_INCLUDE_CREATOR);
      if (this._commonUtil.checkIfDuplicateExists(otherOwnersAddress))
        throw new CustomError(ErrorMap.DUPLICATE_SAFE_OWNER);

      // Find chain
      const chainInfo = await this.generalRepo.findChain(internalChainId);

      await this.checkAddressPubkeyMismatch(
        creatorAddress,
        creatorPubkey,
        chainInfo,
      );

      // Filter empty string in otherOwnersAddress
      otherOwnersAddress =
        this._commonUtil.filterEmptyInStringArray(otherOwnersAddress);

      // insert safe
      const newSafe = await this.safeRepo.insertSafe(
        creatorAddress,
        creatorPubkey,
        otherOwnersAddress,
        threshold,
        internalChainId,
        chainInfo.prefix,
      );
      const safeId = newSafe.id;

      // insert safe_creator
      await this.safeOwnerRepo.insertOwners(
        safeId,
        internalChainId,
        creatorAddress,
        creatorPubkey,
        otherOwnersAddress,
      );

      /**
       * Notify
       * 1. If safe created, notify the creator that safe created
       * 2. If safeAddress is null, notify other owners to allow safe
       */
      if (newSafe.safeAddress) {
        await this.notificationRepo.notifySafeCreated(
          newSafe.id,
          newSafe.safeAddress,
          [creatorAddress],
          newSafe.internalChainId,
        );
      } else {
        // notification to other owners
        await this.notificationRepo.notifyAllowSafe(
          newSafe.id,
          newSafe.creatorAddress,
          otherOwnersAddress,
          newSafe.internalChainId,
        );
      }

      return ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        this._commonUtil.omitByNil(newSafe),
      );
    } catch (error) {
      return ResponseDto.responseError(MultisigWalletService.name, error);
    }
  }

  async getMultisigWallet(
    param: MODULE_REQUEST.GetSafePathParams,
    query: MODULE_REQUEST.GetSafeQuery,
  ): Promise<ResponseDto> {
    let msgError = '';
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
      safeInfo.accountNumber = safe.accountNumber;
      safeInfo.sequence = safe.sequence;
      safeInfo.nextQueueSeq = safe.nextQueueSeq || safe.sequence;
      safeInfo.txHistoryTag = safe.txHistoryTag;
      safeInfo.txQueuedTag = safe.txQueuedTag;
      safeInfo.pubkeys = safe.safePubkey;
      safeInfo.owners = owners.map((o) => o.ownerAddress);
      safeInfo.confirms = confirms.map((o) => o.ownerAddress);
      safeInfo.threshold = safe.threshold;
      safeInfo.status = safe.status;
      safeInfo.internalChainId = safe.internalChainId;
      safeInfo.createdAddress = safe.creatorAddress;
      // get chainInfo
      const chainInfo = await this.generalRepo.findChain(safe.internalChainId);
      // if safe created => Get balance
      if (safeInfo.address !== null) {
        try {
          const accountInfo = await this._indexer.getAccountInfo(
            chainInfo.chainId,
            safeInfo.address,
          );
          safeInfo.balance =
            accountInfo.account_balances &&
            accountInfo.account_balances.length > 0
              ? accountInfo.account_balances
              : [
                  {
                    amount: '0',
                    denom: chainInfo.denom,
                  },
                ];
        } catch (error) {
          msgError = error.message;
          this._logger.error(error.message);
          safeInfo.balance = [
            {
              denom: chainInfo.denom,
              amount: '-1',
            },
          ];
        }
      }
      return ResponseDto.response(ErrorMap.SUCCESSFUL, safeInfo, msgError);
    } catch (error) {
      return ResponseDto.responseError(MultisigWalletService.name, error);
    }
  }

  async confirm(
    param: MODULE_REQUEST.ConfirmSafePathParams,
  ): Promise<ResponseDto> {
    try {
      const { safeId } = param;
      const authInfo = this._commonUtil.getAuthInfo();
      const myAddress = authInfo.address;
      const myPubkey = authInfo.pubkey;

      // find safe
      const safe = await this.safeRepo.getPendingSafe(safeId.toString());
      // get chainInfo
      const chainInfo = await this.generalRepo.findChain(safe.internalChainId);

      await this.checkAddressPubkeyMismatch(myAddress, myPubkey, chainInfo);

      // get confirm status
      const confirmations = await this.safeOwnerRepo.getConfirmationStatus(
        safeId,
        myAddress,
      );

      // update safe owner
      await this.safeOwnerRepo.updateSafeOwner(
        confirmations.find((item) => item.ownerAddress === myAddress),
        myPubkey,
      );

      // if all owner confirmed => create safe
      if (
        confirmations.filter((item) => item.ownerPubkey === null).length === 0
      ) {
        safe.setAddressAndPubkey(
          confirmations.map((item) => item.ownerPubkey),
          chainInfo.prefix,
        );
        safe.status = SAFE_STATUS.CREATED;
        await this.safeRepo.updateSafe(safe);

        await this.notificationRepo.notifySafeCreated(
          safe.id,
          safe.safeAddress,
          confirmations.map((c) => c.ownerAddress),
          safe.internalChainId,
        );
      }

      return ResponseDto.response(ErrorMap.SUCCESSFUL, safe);
    } catch (error) {
      return ResponseDto.responseError(MultisigWalletService.name, error);
    }
  }

  async deletePending(
    param: MODULE_REQUEST.DeleteSafePathParams,
  ): Promise<ResponseDto> {
    try {
      const { safeId } = param;
      const authInfo = this._commonUtil.getAuthInfo();
      const myAddress = authInfo.address;

      const deletedSafe = await this.safeRepo.deletePendingSafe(
        safeId,
        myAddress,
      );
      return ResponseDto.response(ErrorMap.SUCCESSFUL, deletedSafe);
    } catch (error) {
      return ResponseDto.responseError(MultisigWalletService.name, error);
    }
  }

  async getMultisigWalletsByOwner(
    param: MODULE_REQUEST.GetSafesByOwnerAddressParams,
    query: MODULE_REQUEST.GetSafesByOwnerAddressQuery,
  ): Promise<ResponseDto> {
    try {
      const { address } = param;
      const { internalChainId } = query;
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
      return ResponseDto.responseError(MultisigWalletService.name, error);
    }
  }

  async checkAddressPubkeyMismatch(
    address: string,
    pubkey: string,
    chain: Chain,
  ) {
    let generatedAddress;

    if (chain.coinDecimals === 18) {
      generatedAddress = this.ethermintHelper.pubkeyToCosmosAddress(
        pubkey,
        chain.prefix,
      );
    } else {
      // get address from pubkey
      const pubkeyFormated = encodeSecp256k1Pubkey(fromBase64(pubkey));
      generatedAddress = pubkeyToAddress(pubkeyFormated, chain.prefix);
    }

    if (generatedAddress !== address)
      throw new CustomError(ErrorMap.ADDRESS_PUBKEY_MISMATCH);
  }
}
