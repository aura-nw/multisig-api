import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { ObjectLiteral, Repository } from 'typeorm';
import { IMultisigWalletRepository } from '../imultisig-wallet.repository';
import { ENTITIES_CONFIG } from 'src/module.config';
import { SafeOwner } from 'src/entities/safe-owner.entity';

@Injectable()
export class MultisigWalletRepository extends BaseRepository implements IMultisigWalletRepository{
  private readonly _logger = new Logger(MultisigWalletRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.SAFE)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super(repos);
  }
  
  getMultisigWalletInformation(safe_address: string, chainId: string, pubkeys: string) {
    throw new Error('Method not implemented.');
  }

  async getMultisigWalletsByOwner(ownerAddress: string) {
    let sqlQuerry = this.repos
      .createQueryBuilder('safe')
      .innerJoin(
        ENTITIES_CONFIG.SAFE_OWNER,
        'safeOwner',
        'safe.id = safeOwner.safeId',
      )
      .where('safeOwner.ownerAddress = :ownerAddress', { ownerAddress })
      .select();

    let resultData = await sqlQuerry.getRawMany();
    return resultData;
  }
}
