import { Injectable, Logger } from '@nestjs/common';
import { encodeSecp256k1Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import { fromBase64 } from '@cosmjs/encoding';
import { ConfigService } from '@nestjs/config';
import { SimplePublicKey } from '@terra-money/terra.js';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { SafeStatus } from '../../common/constants/app.constant';
import { CommonUtil } from '../../utils/common.util';
import { CustomError } from '../../common/custom-error';
import { pubkeyToAddressEvmos } from '../../chains/evmos';
import { SafeRepository } from './safe.repository';
import { SafeOwnerRepository } from '../safe-owner/safe-owner.repository';
import { ChainRepository } from '../chain/chain.repository';
import { NotificationRepository } from '../notification/notification.repository';
import { CreateMultisigWalletRequestDto } from './dto/request/create-multisig-wallet.req';
import { GetSafePathParamsDto } from './dto/request/get-safe.request';
import { ConfirmSafePathParamsDto } from './dto/request/confirm-multisig-wallet.req';
import { DeleteSafePathParamsDto } from './dto/request/delete-multisig-wallet.req';
import { GetMultisigWalletResponseDto } from './dto/response/get-multisig-wallet.res';
import { Chain } from '../chain/entities/chain.entity';
import { GetSafeQueryDto } from './dto/request/get-safe-query.req';
import { IndexerClient } from '../../shared/services/indexer.service';

@Injectable()
export class SafeService {
  private readonly logger = new Logger(SafeService.name);

  private commonUtil: CommonUtil = new CommonUtil();

  constructor(
    private configService: ConfigService,
    private indexer: IndexerClient,
    private safeRepo: SafeRepository,
    private safeOwnerRepo: SafeOwnerRepository,
    private chainRepo: ChainRepository,
    private notificationRepo: NotificationRepository,
  ) {
    this.logger.log(
      '============== Constructor Multisig Wallet Service ==============',
    );
  }

  async createMultisigWallet(
    request: CreateMultisigWalletRequestDto,
  ): Promise<ResponseDto<any>> {
    try {
      const { threshold, internalChainId } = request;
      let { otherOwnersAddress } = request;

      const authInfo = this.commonUtil.getAuthInfo();
      const creatorAddress = authInfo.address;
      const creatorPubkey = authInfo.pubkey;

      // Check input
      if (otherOwnersAddress.includes(creatorAddress))
        throw new CustomError(ErrorMap.OTHER_ADDRESS_INCLUDE_CREATOR);
      if (CommonUtil.checkIfDuplicateExists(otherOwnersAddress))
        throw new CustomError(ErrorMap.DUPLICATE_SAFE_OWNER);

      // Find chain
      const chainInfo = await this.chainRepo.findChain(internalChainId);

      this.checkAddressPubkeyMismatch(creatorAddress, creatorPubkey, chainInfo);

      // Filter empty string in otherOwnersAddress
      otherOwnersAddress =
        this.commonUtil.filterEmptyInStringArray(otherOwnersAddress);

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
      await (newSafe.safeAddress
        ? this.notificationRepo.notifySafeCreated(
            newSafe.id,
            newSafe.safeAddress,
            [creatorAddress],
            newSafe.internalChainId,
          )
        : // notification to other owners
          this.notificationRepo.notifyAllowSafe(
            newSafe.id,
            newSafe.creatorAddress,
            otherOwnersAddress,
            newSafe.internalChainId,
          ));

      return ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        this.commonUtil.omitByNil(newSafe),
      );
    } catch (error) {
      return ResponseDto.responseError(SafeService.name, error);
    }
  }

  async getMultisigWallet(
    param: GetSafePathParamsDto,
    query: GetSafeQueryDto,
  ): Promise<ResponseDto<any>> {
    try {
      const { safeId } = param;
      const { internalChainId } = query;

      const safe = Number.isNaN(Number(safeId))
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
          const accountInfo = await this.indexer.getAccountInfo(
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
          this.logger.error(error);
          safeInfo.balance = [
            {
              denom: chainInfo.denom,
              amount: '-1',
            },
          ];
        }
      }
      return ResponseDto.response(ErrorMap.SUCCESSFUL, safeInfo);
    } catch (error) {
      return ResponseDto.responseError(SafeService.name, error);
    }
  }

  async confirm(param: ConfirmSafePathParamsDto): Promise<ResponseDto<any>> {
    try {
      const { safeId } = param;
      const authInfo = this.commonUtil.getAuthInfo();
      const myAddress = authInfo.address;
      const myPubkey = authInfo.pubkey;

      // find safe
      const safe = await this.safeRepo.getPendingSafe(safeId);
      // get chainInfo
      const chainInfo = await this.chainRepo.findChain(safe.internalChainId);

      this.checkAddressPubkeyMismatch(myAddress, myPubkey, chainInfo);

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
        safe.status = SafeStatus.CREATED;
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

  async deletePending(
    param: DeleteSafePathParamsDto,
  ): Promise<ResponseDto<any>> {
    try {
      const { safeId } = param;
      const authInfo = this.commonUtil.getAuthInfo();
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

  checkAddressPubkeyMismatch(address: string, pubkey: string, chain: Chain) {
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
