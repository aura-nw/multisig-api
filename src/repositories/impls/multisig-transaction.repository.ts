import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { ObjectLiteral, Repository } from 'typeorm';
import { ENTITIES_CONFIG } from 'src/module.config';
import { IMultisigTransactionsRepository } from '../imultisig-transaction.repository';

@Injectable()
export class MultisigTransactionRepository
  extends BaseRepository
  implements IMultisigTransactionsRepository
{
  private readonly _logger = new Logger(MultisigTransactionRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.MULTISIG_TRANSACTION) private readonly repos: Repository<ObjectLiteral>
    ) {
    super(repos);
  }
}
