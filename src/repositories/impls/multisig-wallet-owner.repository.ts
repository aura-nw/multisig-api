import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { ObjectLiteral, Repository } from 'typeorm';
import { IMultisigWalletOwnerRepository } from '../imultisig-wallet-owner.repository';
import { ENTITIES_CONFIG } from 'src/module.config';
import { Safe, SafeOwner } from 'src/entities';
import { CustomError } from 'src/common/customError';
import { ErrorMap } from 'src/common/error.map';

@Injectable()
export class MultisigWalletOwnerRepository
  extends BaseRepository
  implements IMultisigWalletOwnerRepository
{
  private readonly _logger = new Logger(MultisigWalletOwnerRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.SAFE_OWNER)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Multisig Wallet Owner Repository ==============',
    );
  }

  async getOwners(safeAddress: string) {
    let sqlQuerry = this.repos
      .createQueryBuilder('safeOwner')
      .innerJoin(Safe, 'safe', 'safe.id = safeOwner.safeId')
      .where('safe.safeAddress = :safeAddress', { safeAddress })
      .select(['safeOwner.ownerAddress as OwnerAddress']);
    return sqlQuerry.getRawMany();
  }

  async insertOwners(
    safeId: string,
    internalChainId: number,
    creatorAddress: string,
    creatorPubkey: string,
    otherOwnersAddress: string[],
  ) {
    const owners: SafeOwner[] = [];
    // insert safe_creator
    const safeCreator = new SafeOwner();
    safeCreator.ownerAddress = creatorAddress;
    safeCreator.ownerPubkey = creatorPubkey;
    safeCreator.safeId = safeId;
    safeCreator.internalChainId = internalChainId;
    owners.push(safeCreator);

    for (const ownerAddress of otherOwnersAddress) {
      const safeOwner = new SafeOwner();
      safeOwner.ownerAddress = ownerAddress;
      safeOwner.safeId = safeId;
      safeOwner.internalChainId = internalChainId;
      owners.push(safeOwner);
    }

    try {
      await this.insert(owners);
    } catch (err) {
      throw new CustomError(ErrorMap.INSERT_SAFE_OWNER_FAILED, err.message);
    }
  }

  async getSafeOwnersWithError(safeId: string): Promise<any> {
    const owners = (await this.findByCondition({ safeId })) as SafeOwner[];
    if (!owners || owners.length === 0) {
      this._logger.debug(`Not found any safe owner with safeId: ${safeId}`);
      throw new CustomError(ErrorMap.NO_SAFE_OWNERS_FOUND);
    }
    return owners;
  }

  async getConfirmSafeStatus(
    safeId: string,
    myAddress: string,
    myPubkey: string,
  ): Promise<{
    safeOwner: SafeOwner;
    fullConfirmed: boolean;
    pubkeys: string[];
  }> {
    // get safe owners
    const safeOwners = await this.getSafeOwnersWithError(safeId);

    // get safe owner by address
    const index = safeOwners.findIndex((s) => s.ownerAddress === myAddress);
    if (index === -1)
      throw new CustomError(ErrorMap.SAFE_OWNERS_NOT_INCLUDE_ADDRESS);
    if (safeOwners[index].ownerPubkey !== null)
      throw new CustomError(ErrorMap.SAFE_OWNER_PUBKEY_NOT_EMPTY);

    safeOwners[index].ownerPubkey = myPubkey;
    // check all owner confirmed
    const notReadyOwner = safeOwners.findIndex((s) => s.ownerPubkey === null);
    const fullConfirmed = notReadyOwner !== -1 ? false : true;

    // calculate owner pubKey array
    const pubkeys = safeOwners.map((s) => {
      return s.ownerAddress === myAddress ? myPubkey : s.ownerPubkey;
    });
    return { safeOwner: safeOwners[index], fullConfirmed, pubkeys };
  }

  async updateSafeOwner(safeOwner: SafeOwner): Promise<void> {
    const updateResult = await this.update(safeOwner);
    if (!updateResult) throw new CustomError(ErrorMap.UPDATE_SAFE_OWNER_FAILED);
  }
}
