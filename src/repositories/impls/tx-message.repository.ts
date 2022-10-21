import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TxMessage } from 'src/entities/tx-message.entity';
import { ENTITIES_CONFIG } from 'src/module.config';
import { Repository } from 'typeorm';
import { ITxMessageRepository } from '../itx-message.repository';
import { BaseRepository } from './base.repository';

@Injectable()
export class TxMessageRepository
  extends BaseRepository
  implements ITxMessageRepository
{
  private readonly _logger = new Logger(TxMessageRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.TX_MESSAGE)
    private readonly repos: Repository<TxMessage>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor TxMessage Repository ==============',
    );
  }
}
