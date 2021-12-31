import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { ObjectLiteral, Repository } from 'typeorm';
import { IMultisigWalletRepository } from '../imultisig-wallet.repository';
import { ENTITIES_CONFIG } from 'src/module.config';

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
  }
}
