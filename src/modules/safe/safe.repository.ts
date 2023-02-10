import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ENTITIES_CONFIG } from '../../module.config';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import { SAFE_STATUS } from '../../common/constants/app.constant';
import { createHash } from 'crypto';
import {
  createMultisigThresholdPubkey,
  encodeSecp256k1Pubkey,
  pubkeyToAddress,
} from '@cosmjs/amino';
import { fromBase64 } from '@cosmjs/encoding';
import { IndexerClient } from '../../utils/apis/IndexerClient';
import { ConfigService } from '../../shared/services/config.service';
import { CommonUtil } from '../../utils/common.util';
import { createEvmosPubkey } from '../../chains/evmos';
import { Safe } from './entities/safe.entity';
import { SafeOwnerRepository } from '../safe-owner/safe-owner.repository';
import { ChainRepository } from '../chain/chain.repository';
import { SafeOwner } from '../safe-owner/entities/safe-owner.entity';
import { plainToInstance } from 'class-transformer';
import { GetThresholdResDto } from './dto/res/get-threshold.res';
import { In, Not, Repository } from 'typeorm';
import { GetSafeByOwnerAddressResDto } from './dto/res/get-safe-by-owner.res';

@Injectable()
export class SafeRepository {
  private readonly _logger = new Logger(SafeRepository.name);
  private _indexer = new IndexerClient(this.configService.get('INDEXER_URL'));

  constructor(
    private configService: ConfigService,
    @InjectRepository(Safe)
    private readonly repo: Repository<Safe>,
    private safeOwnerRepo: SafeOwnerRepository,
    private chainRepo: ChainRepository,
  ) {
    this._logger.log(
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
        status: SAFE_STATUS.CREATED,
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
  async updateQueuedTag(safeId: number): Promise<any> {
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
      { safeAddress: safeAddress },
      { txQueuedTag: () => Date.now().toString() },
    );
  }

  async recoverSafe(
    newSafe: Safe,
    otherOwnersAddress: string[],
    chainPrefix: string,
  ): Promise<Safe> {
    // check duplicate with safe address hash
    const safeAddressHash = await this.makeAddressHash(
      newSafe.internalChainId,
      [newSafe.creatorAddress, ...otherOwnersAddress],
      newSafe.threshold,
    );
    newSafe.addressHash = safeAddressHash;
    newSafe.status = SAFE_STATUS.CREATED;

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
        newSafe.status = SAFE_STATUS.CREATED;
      } catch (error) {
        throw new CustomError(
          ErrorMap.CANNOT_CREATE_SAFE_ADDRESS,
          error.message,
        );
      }
    }
    try {
      const result = await this.repo.save(newSafe);
      return result;
    } catch (err) {
      throw new CustomError(ErrorMap.INSERT_SAFE_FAILED, err.message);
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

  async getMultisigWalletsByOwner(
    ownerAddress: string,
    internalChainId: number,
  ): Promise<GetSafeByOwnerAddressResDto[]> {
    const sqlQuerry = this.repo
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

    const result = await sqlQuerry.getRawMany();
    return plainToInstance(GetSafeByOwnerAddressResDto, result);
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
    if (safe.status !== SAFE_STATUS.PENDING)
      throw new CustomError(ErrorMap.SAFE_NOT_PENDING);

    safe.status = SAFE_STATUS.DELETED;
    await this.repo.save(safe);

    return safe;
  }

  async findDuplicateSafeHash(addressHash: string): Promise<number> {
    const existSafe = await this.repo.findOne({
      where: {
        addressHash,
        status: Not(In([SAFE_STATUS.DELETED])),
      },
    });

    if (existSafe) {
      this._logger.debug(`Safe with these information already exists!`);
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
    } catch (err) {
      throw new CustomError(ErrorMap.INSERT_SAFE_FAILED, err.message);
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
      //Found on network
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
    if (safe.status !== SAFE_STATUS.PENDING)
      throw new CustomError(ErrorMap.SAFE_NOT_PENDING);
    return safe;
  }

  async checkAccountOnNetwork(
    accountAddress: string,
    internalChainId: number,
  ): Promise<Safe> {
    const chainInfo = await this.chainRepo.findChain(internalChainId);

    try {
      const pubkeyInfo = await this._indexer.getAccountPubkey(
        chainInfo.chainId,
        accountAddress,
      );

      const ownersAddresses: string[] = pubkeyInfo.public_keys.map((pubkey) => {
        const pubkeyFormated = encodeSecp256k1Pubkey(fromBase64(pubkey.key));
        return pubkeyToAddress(pubkeyFormated, chainInfo.prefix);
      });

      // insert safe
      const newSafe = new Safe();
      newSafe.creatorAddress = ownersAddresses[0];
      newSafe.creatorPubkey = pubkeyInfo.public_keys[0].key;
      newSafe.threshold = pubkeyInfo.threshold;
      newSafe.safeAddress = accountAddress;
      newSafe.safePubkey = JSON.stringify(
        createMultisigThresholdPubkey(
          pubkeyInfo.public_keys.map((pubkey) => {
            return chainInfo.prefix.startsWith('evmos')
              ? createEvmosPubkey(pubkey.key)
              : CommonUtil.createPubkeys(pubkey.key);
          }),
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
      for (let i = 0; i < ownersAddresses.length; i++) {
        promises.push(
          this.safeOwnerRepo.recoverSafeOwner(
            safeId,
            ownersAddresses[i],
            pubkeyInfo.public_keys[i].value,
            internalChainId,
          ),
        );
      }
      await Promise.all(promises);
      return result;
    } catch (error) {
      throw new CustomError(ErrorMap.NO_SAFES_FOUND);
    }
  }

  async updateSafe(safe: Safe): Promise<void> {
    await this.repo.save(safe);
  }
}
