import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import { SafeOwner } from './entities/safe-owner.entity';
import { Safe } from '../safe/entities/safe.entity';

@Injectable()
export class SafeOwnerRepository {
  private readonly _logger = new Logger(SafeOwnerRepository.name);
  constructor(
    @InjectRepository(SafeOwner)
    private readonly repo: Repository<SafeOwner>,
  ) {
    this._logger.log(
      '============== Constructor Safe Owner Repository ==============',
    );
  }

  async getConfirmationStatus(
    safeId: number,
    ownerAddress: string,
  ): Promise<SafeOwner[]> {
    // get list safe owners
    const safeOwners = await this.getSafeOwnersWithError(safeId);

    // get info of owner
    const safeOwnerInfo = safeOwners.find(
      (s) => s.ownerAddress === ownerAddress,
    );

    // if owner not found, throw error
    if (!safeOwnerInfo)
      throw new CustomError(ErrorMap.SAFE_OWNERS_NOT_INCLUDE_ADDRESS);

    // if ownerPubkey is not empty, it means owner already confirmed, throw error
    if (safeOwnerInfo.ownerPubkey !== null)
      throw new CustomError(ErrorMap.SAFE_OWNER_PUBKEY_NOT_EMPTY);

    return safeOwners;
  }

  async updateSafeOwner(
    safeOwner: SafeOwner,
    ownerPubkey: string,
  ): Promise<SafeOwner> {
    safeOwner.ownerPubkey = ownerPubkey;
    const updateResult = await this.repo.save(safeOwner);
    if (!updateResult) throw new CustomError(ErrorMap.UPDATE_SAFE_OWNER_FAILED);
    return updateResult;
  }

  async isSafeOwner(walletAddress: string, safeId: number): Promise<boolean> {
    const result = await this.repo.findOne({
      where: {
        safeId,
        ownerAddress: walletAddress,
      },
    });
    if (!result) throw new CustomError(ErrorMap.PERMISSION_DENIED);
    return true;
  }

  async recoverSafeOwner(
    safeId: number,
    ownerAddress: string,
    ownerPubkey: string,
    internalChainId: number,
  ): Promise<any> {
    const newSafeOwner = new SafeOwner();
    newSafeOwner.ownerAddress = ownerAddress;
    newSafeOwner.ownerPubkey = ownerPubkey;
    newSafeOwner.safeId = safeId;
    newSafeOwner.internalChainId = internalChainId;

    try {
      const result = await this.repo.save(newSafeOwner);
      return result;
    } catch (err) {
      throw new CustomError(ErrorMap.INSERT_SAFE_FAILED, err.message);
    }
  }

  async getOwnersBySafeId(safeId: number) {
    return this.repo.find({
      where: {
        safeId,
      },
    });
  }

  async insertOwners(
    safeId: number,
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
      await this.repo.save(owners);
    } catch (err) {
      throw new CustomError(ErrorMap.INSERT_SAFE_OWNER_FAILED, err.message);
    }
  }

  async getSafeOwnersWithError(safeId: number): Promise<SafeOwner[]> {
    const owners = await this.repo.find({
      where: { safeId },
    });
    if (owners.length === 0) {
      this._logger.debug(`Not found any safe owner with safeId: ${safeId}`);
      throw new CustomError(ErrorMap.NO_SAFE_OWNERS_FOUND);
    }
    return owners;
  }
}
