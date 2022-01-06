import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { ObjectLiteral, Repository } from 'typeorm';
import { IMultisigWalletOwnerRepository } from '../imultisig-wallet-owner.repository';
import { ENTITIES_CONFIG } from 'src/module.config';

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
  }
}
