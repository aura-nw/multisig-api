import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { ObjectLiteral, Repository } from 'typeorm';
import { ENTITIES_CONFIG } from 'src/module.config';
import { IMultisigConfirmRepository } from '../imultisig-confirm.repository';

@Injectable()
export class MultisigConfirmRepository
  extends BaseRepository
  implements IMultisigConfirmRepository
{
  private readonly _logger = new Logger(MultisigConfirmRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.MULTISIG_CONFIRM) private readonly repos: Repository<ObjectLiteral>
    ) {
    super(repos);
  }
}
