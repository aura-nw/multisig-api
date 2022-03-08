import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { ObjectLiteral, Repository } from 'typeorm';
import { IMultisigWalletRepository } from '../imultisig-wallet.repository';
import { ENTITIES_CONFIG } from 'src/module.config';
import { Safe, SafeOwner } from 'src/entities';
import { CustomError } from 'src/common/customError';
import { ErrorMap } from 'src/common/error.map';
import { SAFE_STATUS } from 'src/common/constants/app.constant';

@Injectable()
export class MultisigWalletRepository
  extends BaseRepository
  implements IMultisigWalletRepository
{
  private readonly _logger = new Logger(MultisigWalletRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.SAFE)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Multisig Wallet Repository ==============',
    );
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

  async deletePendingSafe(condition: any, myAddress: string) {
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
}
