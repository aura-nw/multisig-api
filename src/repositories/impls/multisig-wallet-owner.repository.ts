import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { ObjectLiteral, Repository } from 'typeorm';
import { IMultisigWalletOwnerRepository } from '../imultisig-wallet-owner.repository';
import { ENTITIES_CONFIG } from 'src/module.config';
import { Safe } from 'src/entities';

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
        .select([
            'safeOwner.ownerAddress as OwnerAddress',
        ]);
    let resultData = await sqlQuerry.getRawMany();
    return resultData;
  }
}
