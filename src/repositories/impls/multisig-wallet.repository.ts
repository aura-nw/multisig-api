import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { ObjectLiteral, Repository } from 'typeorm';
import { IMultisigWalletRepository } from '../imultisig-wallet.repository';
import { ENTITIES_CONFIG } from 'src/module.config';
import { SafeOwner } from 'src/entities';

@Injectable()
export class MultisigWalletRepository extends BaseRepository implements IMultisigWalletRepository {
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

  async checkOwnerMultisigWallet(owner_address: string, safe_address: string, pubkeys: string) {
    let sqlQuerry = this.repos.createQueryBuilder('safe').innerJoin(SafeOwner, 'safeOwner', 'safe.id = safeOwner.safeId')
      .where('safe.safeAddress = :safeAddress', { safe_address })
      .andWhere('safe.creatorAddress = :creatorAddress', { owner_address }).orWhere('')
    return sqlQuerry.getRawMany();
  }

  async getMultisigWalletsByOwner(ownerAddress: string, internalChainId: number): Promise<any[]> {
    let sqlQuerry = this.repos
      .createQueryBuilder('safe')
      .innerJoin(
        ENTITIES_CONFIG.SAFE_OWNER,
        'safeOwner',
        'safe.id = safeOwner.safeId',
      )
      .where('safeOwner.ownerAddress = :ownerAddress', { ownerAddress })
      .andWhere('safeOwner.internalChainId = :internalChainId', { internalChainId })
      .select([
        'safe.id as id',
        'safe.safeAddress as safeAddress',
        'safe.creatorAddress as creatorAddress',
        'safe.status as status',
        'safeOwner.ownerAddress as ownerAddress',
        'safeOwner.ownerPubkey as ownerPubkey',
        'safeOwner.internalChainId as internalChainId'
      ]);

    return sqlQuerry.getRawMany();
  }

  async getThreshold(safeAddress: string) {
    let sqlQuerry = this.repos
      .createQueryBuilder('safe')
      .where('safe.safeAddress = :safeAddress', { safeAddress })
      .select([
        'safe.threshold as ConfirmationsRequired',
      ]);
    return sqlQuerry.getRawOne();
  }
}
