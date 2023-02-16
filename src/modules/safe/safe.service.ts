import { Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from '../../dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { SAFE_STATUS } from '../../common/constants/app.constant';
import { CommonUtil } from '../../utils/common.util';
import { CustomError } from '../../common/customError';
import { encodeSecp256k1Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import { fromBase64 } from '@cosmjs/encoding';
import { SimplePublicKey } from '@terra-money/terra.js';
import { pubkeyToAddressEvmos } from '../../chains/evmos';
import { IndexerClient } from '../../utils/apis/indexer-client.service';
import { ConfigService } from '../../shared/services/config.service';
import { SafeRepository } from './safe.repository';
import { SafeOwnerRepository } from '../safe-owner/safe-owner.repository';
import { ChainRepository } from '../chain/chain.repository';
import { NotificationRepository } from '../notification/notification.repository';
import { CreateMultisigWalletRequestDto } from './dto/request/create-multisig-wallet.req';
import {
  GetSafePathParamsDto,
  GetSafeQueryDto,
} from './dto/request/get-safe.request';
import { ConfirmSafePathParamsDto } from './dto/request/confirm-multisig-wallet.req';
import { DeleteSafePathParamsDto } from './dto/request/delete-multisig-wallet.req';
import { GetMultisigWalletResponseDto } from './dto/response/get-multisig-wallet.res';
import { Chain } from '../chain/entities/chain.entity';

@Injectable()
export class SafeService {
  private readonly _logger = new Logger(SafeService.name);
  private _commonUtil: CommonUtil = new CommonUtil();
  private _indexer = new IndexerClient(this.configService.get('INDEXER_URL'));

  constructor(
    private configService: ConfigService,
    private safeRepo: SafeRepository,
    private safeOwnerRepo: SafeOwnerRepository,
    private chainRepo: ChainRepository,
    private notificationRepo: NotificationRepository,
  ) {
    this._logger.log(
      '============== Constructor Multisig Wallet Service ==============',
    );
  }

  async createMultisigWallet(
    request: CreateMultisigWalletRequestDto,
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
      const chainInfo = await this.chainRepo.findChain(internalChainId);

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
      return ResponseDto.responseError(SafeService.name, error);
    }
  }

  async getMultisigWallet(
    param: GetSafePathParamsDto,
    query: GetSafeQueryDto,
  ): Promise<ResponseDto> {
    let msgError = '';
    try {
      const { safeId } = param;
      const { internalChainId } = query;

      const safe = isNaN(Number(safeId))
        ? await this.safeRepo.getSafeByAddress(safeId, internalChainId)
        : await this.safeRepo.getSafeById(Number(safeId));

      // find safe owner
      const owners = await this.safeOwnerRepo.getSafeOwnersWithError(safe.id);
      // get confirm list
      const confirms = owners.filter(({ ownerPubkey }) => ownerPubkey !== null);

      // build safe info
      const safeInfo = new GetMultisigWalletResponseDto();
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
      const chainInfo = await this.chainRepo.findChain(safe.internalChainId);
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
      return ResponseDto.responseError(SafeService.name, error);
    }
  }

  async confirm(param: ConfirmSafePathParamsDto): Promise<ResponseDto> {
    try {
      const { safeId } = param;
      const authInfo = this._commonUtil.getAuthInfo();
      const myAddress = authInfo.address;
      const myPubkey = authInfo.pubkey;

      // find safe
      const safe = await this.safeRepo.getPendingSafe(safeId);
      // get chainInfo
      const chainInfo = await this.chainRepo.findChain(safe.internalChainId);

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
      return ResponseDto.responseError(SafeService.name, error);
    }
  }

  async deletePending(param: DeleteSafePathParamsDto): Promise<ResponseDto> {
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
      return ResponseDto.responseError(SafeService.name, error);
    }
  }

  async checkAddressPubkeyMismatch(
    address: string,
    pubkey: string,
    chain: Chain,
  ) {
    let generatedAddress;

    if (chain.name === 'Terra Testnet') {
      const simplePubkey = new SimplePublicKey(pubkey);
      generatedAddress = simplePubkey.address();
    } else if (chain.prefix.startsWith('evmos')) {
      generatedAddress = pubkeyToAddressEvmos(pubkey);
    } else {
      // get address from pubkey
      const pubkeyFormated = encodeSecp256k1Pubkey(fromBase64(pubkey));
      generatedAddress = pubkeyToAddress(pubkeyFormated, chain.prefix);
    }

    if (generatedAddress !== address)
      throw new CustomError(ErrorMap.ADDRESS_PUBKEY_MISMATCH);
  }
}
