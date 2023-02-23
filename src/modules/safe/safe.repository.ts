import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import {
  createMultisigThresholdPubkey,
  encodeSecp256k1Pubkey,
  pubkeyToAddress,
} from '@cosmjs/amino';
import { fromBase64 } from '@cosmjs/encoding';
import { plainToInstance } from 'class-transformer';
import { In, Not, Repository, UpdateResult } from 'typeorm';
import { CustomError } from '../../common/custom-error';
import { ErrorMap } from '../../common/error.map';
import { SafeStatus } from '../../common/constants/app.constant';
import { CommonUtil } from '../../utils/common.util';
import { createEvmosPubkey } from '../../chains/evmos';
import { Safe } from './entities/safe.entity';
import { SafeOwnerRepository } from '../safe-owner/safe-owner.repository';
import { ChainRepository } from '../chain/chain.repository';
import { SafeOwner } from '../safe-owner/entities/safe-owner.entity';
import { GetThresholdResDto } from './dto/request/get-threshold.res';
import { IndexerClient } from '../../shared/services/indexer.service';

@Injectable()
export class SafeRepository {
  private readonly logger = new Logger(SafeRepository.name);

  constructor(
    private indexer: IndexerClient,
    @InjectRepository(Safe)
    private readonly repo: Repository<Safe>,
    private safeOwnerRepo: SafeOwnerRepository,
    private chainRepo: ChainRepository,
  ) {
    this.logger.log(
      '============== Constructor Safe Repository ==============',
    );
  }

  /**
   * getAllSafeAddress
   * @returns
   */
  async getAllSafeAddress(): Promise<string[]> {
    const safeAddress = await this.repo.find({
      where: {
        status: SafeStatus.CREATED,
      },
      select: ['safeAddress'],
    });
    return safeAddress.map((safe) => safe.safeAddress);
  }

  /**
   * updateQueuedTag
   * @param safeId
   * @returns
   */
  async updateQueuedTag(safeId: number): Promise<UpdateResult> {
    return this.repo.update(
      { id: safeId },
      { txQueuedTag: () => Date.now().toString() },
    );
  }

  /**
   * updateQueuedTagByAddress
   * @param safeId
   * @returns
   */
  async updateQueuedTagByAddress(safeAddress: string): Promise<void> {
    await this.repo.update(
      { safeAddress },
      { txQueuedTag: () => Date.now().toString() },
    );
  }

  async recoverSafe(
    safe: Safe,
    otherOwnersAddress: string[],
    chainPrefix: string,
  ): Promise<Safe> {
    const newSafe = safe;
    // check duplicate with safe address hash
    const safeAddressHash = await this.makeAddressHash(
      newSafe.internalChainId,
      [newSafe.creatorAddress, ...otherOwnersAddress],
      newSafe.threshold,
    );
    newSafe.addressHash = safeAddressHash;
    newSafe.status = SafeStatus.CREATED;

    // check if need create safe address
    if (otherOwnersAddress.length === 0) {
      try {
        const { address, pubkey } = CommonUtil.createSafeAddressAndPubkey(
          [newSafe.creatorPubkey],
          newSafe.threshold,
          chainPrefix,
        );
        newSafe.safeAddress = address;
        newSafe.safePubkey = pubkey;
        newSafe.status = SafeStatus.CREATED;
      } catch (error) {
        throw CustomError.fromUnknown(
          ErrorMap.CANNOT_CREATE_SAFE_ADDRESS,
          error,
        );
      }
    }
    try {
      const result = await this.repo.save(newSafe);
      return result;
    } catch (error) {
      throw CustomError.fromUnknown(ErrorMap.INSERT_SAFE_FAILED, error);
    }
  }

  async checkOwnerMultisigWallet(owner_address: string, safe_address: string) {
    const sqlQuerry = this.repo
      .createQueryBuilder('safe')
      .innerJoin(SafeOwner, 'safeOwner', 'safe.id = safeOwner.safeId')
      .where('safe.safeAddress = :safeAddress', { safe_address })
      .andWhere('safe.creatorAddress = :creatorAddress', { owner_address })
      .orWhere('');
    return sqlQuerry.getRawMany();
  }

  async getThreshold(safeAddress: string) {
    const result = await this.repo.findOne({
      where: {
        safeAddress,
      },
      select: ['threshold'],
    });
    if (!result) throw new CustomError(ErrorMap.NO_SAFES_FOUND);
    return plainToInstance(GetThresholdResDto, {
      ConfirmationsRequired: result.threshold,
    });
  }

  async deletePendingSafe(safeId: number, myAddress: string): Promise<Safe> {
    const safe = await this.getSafeById(safeId);

    if (safe.creatorAddress !== myAddress)
      throw new CustomError(ErrorMap.ADDRESS_NOT_CREATOR);
    if (safe.status !== SafeStatus.PENDING)
      throw new CustomError(ErrorMap.SAFE_NOT_PENDING);

    safe.status = SafeStatus.DELETED;
    await this.repo.save(safe);

    return safe;
  }

  async findDuplicateSafeHash(addressHash: string): Promise<number> {
    const existSafe = await this.repo.findOne({
      where: {
        addressHash,
        status: Not(In([SafeStatus.DELETED])),
      },
    });

    if (existSafe) {
      this.logger.debug('Safe with these information already exists!');
      return existSafe.id;
    }
    return -1;
  }

  async makeAddressHash(
    internalChainId: number,
    addresses: string[],
    threshold: number,
  ): Promise<string> {
    const safeAddress = {
      addresses: [...addresses].sort(),
      threshold,
      internalChainId,
    };
    const safeAddressHash = createHash('sha256')
      .update(JSON.stringify(safeAddress))
      .digest('base64');
    const safeId = await this.findDuplicateSafeHash(safeAddressHash);
    if (safeId > -1)
      throw new CustomError(
        ErrorMap.DUPLICATE_SAFE_ADDRESS_HASH,
        safeId.toString(),
      );
    return safeAddressHash;
  }

  async insertSafe(
    creatorAddress: string,
    creatorPubkey: string,
    otherOwnersAddress: string[],
    threshold: number,
    internalChainId: number,
    chainPrefix: string,
  ): Promise<Safe> {
    // check duplicate with safe address hash
    const safeAddressHash = await this.makeAddressHash(
      internalChainId,
      [creatorAddress, ...otherOwnersAddress],
      threshold,
    );

    // create safe
    const newSafe = Safe.buildSafe(
      [creatorPubkey],
      otherOwnersAddress.length + 1,
      threshold,
      chainPrefix,
    );
    newSafe.creatorAddress = creatorAddress;
    newSafe.creatorPubkey = creatorPubkey;
    newSafe.internalChainId = internalChainId;
    newSafe.addressHash = safeAddressHash;

    try {
      const result: Safe = await this.repo.save(newSafe);
      return result;
    } catch (error) {
      throw CustomError.fromUnknown(ErrorMap.INSERT_SAFE_FAILED, error);
    }
  }

  async getSafeById(safeId: number): Promise<Safe> {
    // find safe on DB
    const safe = await this.repo.findOne({
      where: {
        id: Number(safeId),
      },
    });

    if (!safe) {
      // Found on network
      throw new CustomError(ErrorMap.NO_SAFES_FOUND);
    }
    return safe;
  }

  async getSafeByAddress(
    safeAddress: string,
    internalChainId: number,
  ): Promise<Safe> {
    let safe = await this.repo.findOne({
      where: {
        safeAddress,
        internalChainId: internalChainId || -1,
      },
    });

    // Find on network if not exists in DB
    if (!safe) {
      safe = await this.checkAccountOnNetwork(safeAddress, internalChainId);
    }
    return safe;
  }

  async getPendingSafe(safeId: number): Promise<Safe> {
    const safe = await this.getSafeById(safeId);
    // check safe
    if (safe.status !== SafeStatus.PENDING)
      throw new CustomError(ErrorMap.SAFE_NOT_PENDING);
    return safe;
  }

  async checkAccountOnNetwork(
    accountAddress: string,
    internalChainId: number,
  ): Promise<Safe> {
    const chainInfo = await this.chainRepo.findChain(internalChainId);

    try {
      const pubkeyInfo = await this.indexer.getAccountPubkey(
        chainInfo.chainId,
        accountAddress,
      );

      const ownersAddresses: string[] = pubkeyInfo.public_keys.map((pubkey) => {
        const pubkeyFormated = encodeSecp256k1Pubkey(fromBase64(pubkey.key));
        return pubkeyToAddress(pubkeyFormated, chainInfo.prefix);
      });

      // insert safe
      const newSafe = new Safe();
      const [creatorAddress] = ownersAddresses;
      newSafe.creatorAddress = creatorAddress;
      newSafe.creatorPubkey = pubkeyInfo.public_keys[0].key;
      newSafe.threshold = pubkeyInfo.threshold;
      newSafe.safeAddress = accountAddress;
      newSafe.safePubkey = JSON.stringify(
        createMultisigThresholdPubkey(
          pubkeyInfo.public_keys.map((pubkey) =>
            chainInfo.prefix.startsWith('evmos')
              ? createEvmosPubkey(pubkey.key)
              : CommonUtil.createPubkeys(pubkey.key),
          ),
          pubkeyInfo.threshold,
        ),
      );
      newSafe.internalChainId = internalChainId;

      const result = await this.recoverSafe(
        newSafe,
        ownersAddresses.slice(1),
        chainInfo.prefix,
      );
      const safeId = result.id;

      // insert safe owner
      const promises = [];
      for (const [i, ownersAddress] of ownersAddresses.entries()) {
        promises.push(
          this.safeOwnerRepo.recoverSafeOwner(
            safeId,
            ownersAddress,
            pubkeyInfo.public_keys[i].key,
            internalChainId,
          ),
        );
      }
      await Promise.all(promises);
      return result;
    } catch {
      throw new CustomError(ErrorMap.NO_SAFES_FOUND);
    }
  }

  async updateSafe(safe: Safe): Promise<void> {
    await this.repo.save(safe);
  }
}
