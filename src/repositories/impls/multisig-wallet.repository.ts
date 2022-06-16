import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { ObjectLiteral, Repository } from 'typeorm';
import { IMultisigWalletRepository } from '../imultisig-wallet.repository';
import { ENTITIES_CONFIG, REPOSITORY_INTERFACE } from 'src/module.config';
import { Safe, SafeOwner } from 'src/entities';
import { CustomError } from 'src/common/customError';
import { ErrorMap } from 'src/common/error.map';
import { SAFE_STATUS } from 'src/common/constants/app.constant';
import { createHash } from 'crypto';
import { pubkeyToAddress } from '@cosmjs/amino';
import { StargateClient } from '@cosmjs/stargate';
import { IGeneralRepository } from '../igeneral.repository';
import { IMultisigWalletOwnerRepository } from '../imultisig-wallet-owner.repository';

@Injectable()
export class MultisigWalletRepository
  extends BaseRepository
  implements IMultisigWalletRepository
{
  private readonly _logger = new Logger(MultisigWalletRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.SAFE)
    private readonly repos: Repository<ObjectLiteral>,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_OWNER_REPOSITORY)
    private safeOwnerRepo: IMultisigWalletOwnerRepository,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private generalRepo: IGeneralRepository,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Multisig Wallet Repository ==============',
    );
  }

  async recoverSafe(
    safeAddress: string,
    safePubkey: string,
    creatorAddress: string,
    creatorPubkey: string,
    otherOwnersAddress: string[],
    threshold: number,
    internalChainId: number,
    chainPrefix: string,
  ): Promise<any> {
    const newSafe = new ENTITIES_CONFIG.SAFE();
    newSafe.creatorAddress = creatorAddress;
    newSafe.creatorPubkey = creatorPubkey;
    newSafe.threshold = threshold;
    newSafe.safeAddress = safeAddress;
    newSafe.safePubkey = safePubkey;
    newSafe.internalChainId = internalChainId;

    // check duplicate with safe address hash
    const safeAddressHash = await this.makeAddressHash(
      newSafe.internalChainId,
      [creatorAddress, ...otherOwnersAddress],
      threshold,
    );
    newSafe.addressHash = safeAddressHash;
    newSafe.status = SAFE_STATUS.CREATED;

    // check if need create safe address
    if (otherOwnersAddress.length === 0) {
      try {
        const { address, pubkey } = this._commonUtil.createSafeAddressAndPubkey(
          [creatorPubkey],
          threshold,
          chainPrefix,
        );
        newSafe.safeAddress = address;
        newSafe.safePubkey = pubkey;
        newSafe.status = SAFE_STATUS.CREATED;
      } catch (error) {
        throw new CustomError(
          ErrorMap.CANNOT_CREATE_SAFE_ADDRESS,
          error.message,
        );
      }
    }
    try {
      const result = await this.create(newSafe);
      return result;
    } catch (err) {
      throw new CustomError(ErrorMap.INSERT_SAFE_FAILED, err.message);
    }
  }

  async checkOwnerMultisigWallet(owner_address: string, safe_address: string) {
    const sqlQuerry = this.repos
      .createQueryBuilder('safe')
      .innerJoin(SafeOwner, 'safeOwner', 'safe.id = safeOwner.safeId')
      .where('safe.safeAddress = :safeAddress', { safe_address })
      .andWhere('safe.creatorAddress = :creatorAddress', { owner_address })
      .orWhere('');
    return sqlQuerry.getRawMany();
  }

  async getMultisigWalletsByOwner(
    ownerAddress: string,
    internalChainId: number,
  ): Promise<any[]> {
    const sqlQuerry = this.repos
      .createQueryBuilder('safe')
      .innerJoin(
        ENTITIES_CONFIG.SAFE_OWNER,
        'safeOwner',
        'safe.id = safeOwner.safeId',
      )
      .where('safeOwner.ownerAddress = :ownerAddress', { ownerAddress })
      .andWhere('safeOwner.internalChainId = :internalChainId', {
        internalChainId,
      })
      .select([
        'safe.id as id',
        'safe.safeAddress as safeAddress',
        'safe.creatorAddress as creatorAddress',
        'safe.status as status',
        'safeOwner.ownerAddress as ownerAddress',
        'safeOwner.ownerPubkey as ownerPubkey',
        'safeOwner.internalChainId as internalChainId',
      ]);

    return sqlQuerry.getRawMany();
  }

  async getThreshold(safeAddress: string) {
    const sqlQuerry = this.repos
      .createQueryBuilder('safe')
      .where('safe.safeAddress = :safeAddress', { safeAddress })
      .select(['safe.threshold as ConfirmationsRequired']);
    return sqlQuerry.getRawOne();
  }

  async deletePendingSafe(safeId: string, myAddress: string) {
    const condition = this.calculateCondition(safeId);
    const safes = await this.findByCondition(condition);
    if (safes.length === 0) throw new CustomError(ErrorMap.NO_SAFES_FOUND);
    const safe = safes[0] as Safe;
    if (safe.creatorAddress !== myAddress)
      throw new CustomError(ErrorMap.ADDRESS_NOT_CREATOR);
    if (safe.status !== SAFE_STATUS.PENDING)
      throw new CustomError(ErrorMap.SAFE_NOT_PENDING);
    safe.status = SAFE_STATUS.DELETED;
    await this.update(safe);
    return safe;
  }

  async findDuplicateSafeHash(addressHash) {
    const existSafe = await this.findByCondition({ addressHash }, null, [
      'id',
      'addressHash',
      'status',
    ]);
    // filter deleted status
    if (existSafe && existSafe.length > 0) {
      const existList = existSafe.filter(
        (safe) => safe.status !== SAFE_STATUS.DELETED,
      );
      if (existList && existList.length > 0) {
        this._logger.debug(`Safe with these information already exists!`);
        throw new CustomError(ErrorMap.DUPLICATE_SAFE_ADDRESS_HASH);
      }
    }
    return false;
  }

  async makeAddressHash(
    internalChainId: number,
    addresses: string[],
    threshold: number,
  ): Promise<string> {
    const safeAddress = {
      addresses: addresses.sort(),
      threshold,
      internalChainId,
    };
    const safeAddressHash = createHash('sha256')
      .update(JSON.stringify(safeAddress))
      .digest('base64');
    const isDuplicate = await this.findDuplicateSafeHash(safeAddressHash);
    if (isDuplicate)
      throw new CustomError(ErrorMap.DUPLICATE_SAFE_ADDRESS_HASH);
    return safeAddressHash;
  }

  async insertSafe(
    creatorAddress: string,
    creatorPubkey: string,
    otherOwnersAddress: string[],
    threshold: number,
    internalChainId: number,
    chainPrefix: string,
  ): Promise<any> {
    const newSafe = new ENTITIES_CONFIG.SAFE();
    newSafe.creatorAddress = creatorAddress;
    newSafe.creatorPubkey = creatorPubkey;
    newSafe.threshold = threshold;
    newSafe.internalChainId = internalChainId;

    // check duplicate with safe address hash
    const safeAddressHash = await this.makeAddressHash(
      newSafe.internalChainId,
      [creatorAddress, ...otherOwnersAddress],
      threshold,
    );
    newSafe.addressHash = safeAddressHash;
    newSafe.status = SAFE_STATUS.PENDING;

    // check if need create safe address
    if (otherOwnersAddress.length === 0) {
      try {
        const { address, pubkey } = this._commonUtil.createSafeAddressAndPubkey(
          [creatorPubkey],
          threshold,
          chainPrefix,
        );
        newSafe.safeAddress = address;
        newSafe.safePubkey = pubkey;
        newSafe.status = SAFE_STATUS.CREATED;
      } catch (error) {
        throw new CustomError(
          ErrorMap.CANNOT_CREATE_SAFE_ADDRESS,
          error.message,
        );
      }
    }
    try {
      const result = await this.create(newSafe);
      return result;
    } catch (err) {
      throw new CustomError(ErrorMap.INSERT_SAFE_FAILED, err.message);
    }
  }

  async getSafe(safeId: string, internalChainId?: number): Promise<any> {
    let condition = this.calculateCondition(safeId, internalChainId);

    // find safes on offchain
    const safes = await this.findByCondition(condition);
    if (!safes || safes.length === 0) {
      //Found on network
      await this.checkAccountOnNetwork(safeId, internalChainId);
    }
    const newSafe = await this.findByCondition(condition);
    if (!newSafe || newSafe.length === 0) {
      //Found on network
      throw new CustomError(ErrorMap.NO_SAFES_FOUND);
    }
    return newSafe[0];
  }

  async getPendingSafe(safeId: string, internalChainId?: number): Promise<any> {
    const safe = await this.getSafe(safeId, internalChainId);
    // check safe
    if (safe.status !== SAFE_STATUS.PENDING)
      throw new CustomError(ErrorMap.SAFE_NOT_PENDING);
    return safe;
  }

  async confirmSafe(
    safe: Safe,
    pubkeys: string[],
    prefix: string,
  ): Promise<Safe> {
    try {
      const safeInfo = this._commonUtil.createSafeAddressAndPubkey(
        pubkeys,
        safe.threshold,
        prefix,
      );
      safe.safeAddress = safeInfo.address;
      safe.safePubkey = safeInfo.pubkey;
      safe.status = SAFE_STATUS.CREATED;
    } catch (error) {
      throw new CustomError(ErrorMap.CANNOT_CREATE_SAFE_ADDRESS, error.message);
    }
    // update safe
    await this.update(safe);
    return safe;
  }

  async getCreatedSafe(
    safeId: string,
    internalChainId?: number,
  ): Promise<Safe> {
    const safe = await this.getSafe(safeId, internalChainId);

    if (!safe.safeAddress || safe.safeAddress === null) {
      throw new CustomError(ErrorMap.SAFE_ADDRESS_IS_NULL);
    }
    return safe;
  }

  private calculateCondition(safeId: string, internalChainId?: number) {
    return isNaN(Number(safeId))
      ? {
          safeAddress: safeId,
          internalChainId: internalChainId || '',
        }
      : {
          id: safeId,
        };
  }

  async checkAccountOnNetwork(
    accountAddress: string,
    internalChainId: number,
  ): Promise<any> {
    let chainInfo = await this.generalRepo.findOne({
      where: { id: internalChainId },
    });

    let client = await StargateClient.connect(chainInfo.rpc);

    try {
      let accountOnChain = await client.getAccount(accountAddress);
      if (accountOnChain.pubkey == null)
        throw new CustomError(ErrorMap.NO_SAFES_FOUND);
      console.log(accountOnChain);
      let otherOwnersAddress = [];
      for (let i = 1; i < accountOnChain.pubkey.value.pubkeys.length; i++) {
        let ownerAddress = pubkeyToAddress(
          accountOnChain.pubkey.value.pubkeys[i],
          chainInfo.prefix,
        );
        otherOwnersAddress.push(ownerAddress);
      }

      // insert safe
      const result = await this.recoverSafe(
        accountOnChain.address,
        JSON.stringify(accountOnChain.pubkey),
        pubkeyToAddress(
          accountOnChain.pubkey.value.pubkeys[0],
          chainInfo.prefix,
        ),
        accountOnChain.pubkey.value.pubkeys[0].value,
        otherOwnersAddress,
        accountOnChain.pubkey.value.threshold,
        internalChainId,
        chainInfo.prefix,
      );
      const safeId = result.id;

      // insert safe_creator
      await this.safeOwnerRepo.insertOwners(
        safeId,
        internalChainId,
        pubkeyToAddress(
          accountOnChain.pubkey.value.pubkeys[0],
          chainInfo.prefix,
        ),
        accountOnChain.pubkey.value.pubkeys[0].value,
        otherOwnersAddress,
      );

      // insert safe owner
      for (let i = 1; i < accountOnChain.pubkey.value.pubkeys.length; i++) {
        await this.safeOwnerRepo.recoverSafeOwner(
          safeId,
          pubkeyToAddress(
            accountOnChain.pubkey.value.pubkeys[i],
            chainInfo.prefix,
          ),
          accountOnChain.pubkey.value.pubkeys[i].value,
          internalChainId,
        );
      }
    } catch (error) {
      throw new CustomError(ErrorMap.NO_SAFES_FOUND);
    }
  }
}
