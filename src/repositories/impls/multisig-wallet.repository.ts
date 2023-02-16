import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { In, Not, Repository } from 'typeorm';
import { IMultisigWalletRepository } from '../imultisig-wallet.repository';
import { ENTITIES_CONFIG, REPOSITORY_INTERFACE } from '../../module.config';
import { Safe, SafeOwner } from '../../entities';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import { SAFE_STATUS } from '../../common/constants/app.constant';
import { createHash } from 'crypto';
import {
  createMultisigThresholdPubkey,
  encodeSecp256k1Pubkey,
  pubkeyToAddress,
} from '@cosmjs/amino';
import { IGeneralRepository } from '../igeneral.repository';
import { IMultisigWalletOwnerRepository } from '../imultisig-wallet-owner.repository';
import { fromBase64 } from '@cosmjs/encoding';
import { IndexerClient } from '../../utils/apis/indexer-client.service';
import { ConfigService } from '../../shared/services/config.service';
import { CommonUtil } from '../../utils/common.util';
import { createEvmosPubkey } from '../../chains/evmos';

@Injectable()
export class MultisigWalletRepository
  extends BaseRepository
  implements IMultisigWalletRepository
{
  private readonly _logger = new Logger(MultisigWalletRepository.name);
  private _indexer = new IndexerClient(this.configService.get('INDEXER_URL'));

  constructor(
    private configService: ConfigService,
    @InjectRepository(ENTITIES_CONFIG.SAFE)
    private readonly repos: Repository<Safe>,
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

  async getAllSafeAddress(): Promise<string[]> {
    const safeAddress = await this.repos
      .createQueryBuilder('safe')
      .select(['safe.safeAddress'])
      .where('safe.status = :status', { status: SAFE_STATUS.CREATED })
      .getMany();
    return safeAddress.map((safe) => safe.safeAddress);
  }

  /**
   *
   * @param safeId
   * @returns
   */
  async updateQueuedTag(safeId: number): Promise<any> {
    return this.repos.update(
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
    await this.repos.update(
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
    const result = await sqlQuerry.getRawOne();
    if (!result) throw new CustomError(ErrorMap.NO_SAFES_FOUND);
    return result;
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

  async findDuplicateSafeHash(addressHash): Promise<number> {
    const existSafe = await this.findOne({
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
      const result: Safe = await this.create(newSafe);
      return result;
    } catch (err) {
      throw new CustomError(ErrorMap.INSERT_SAFE_FAILED, err.message);
    }
  }

  async getSafe(safeId: string, internalChainId?: number): Promise<Safe> {
    const condition = this.calculateCondition(safeId, internalChainId);

    // find safes on offchain
    let safe = await this.findOne(condition);
    //Found on network
    if (!safe && internalChainId && condition.safeAddress) {
      await this.checkAccountOnNetwork(condition.safeAddress, internalChainId);
      safe = await this.findOne(condition);
    }

    if (!safe) {
      //Found on network
      throw new CustomError(ErrorMap.NO_SAFES_FOUND);
    }
    return safe;
  }

  async getPendingSafe(
    safeId: string,
    internalChainId?: number,
  ): Promise<Safe> {
    const safe = await this.getSafe(safeId, internalChainId);
    // check safe
    if (safe.status !== SAFE_STATUS.PENDING)
      throw new CustomError(ErrorMap.SAFE_NOT_PENDING);
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
    const chainInfo = await this.generalRepo.findOne({
      where: { id: internalChainId },
    });
    if (!chainInfo) throw new CustomError(ErrorMap.CHAIN_NOT_FOUND);

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
    } catch (error) {
      throw new CustomError(ErrorMap.NO_SAFES_FOUND);
    }
  }

  async updateSafe(safe: Safe): Promise<void> {
    await this.repos.save(safe);
  }
}
