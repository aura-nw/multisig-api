import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Message } from 'src/entities';
import { ENTITIES_CONFIG } from 'src/module.config';
import { Repository } from 'typeorm';
import { IMessageRepository } from '../imessage.repository';
import { BaseRepository } from './base.repository';

@Injectable()
export class MessageRepository extends BaseRepository implements IMessageRepository {
  private readonly _logger = new Logger(MessageRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.MESSAGE)
    private readonly repos: Repository<Message>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Message Repository ==============',
    );
  }

  async saveMsgs(txId: number, msgs: any[]): Promise<Message[]> {
    const newMsgs = msgs.map((msg) => {
      const newMsg = plainToClass(Message, msg.value, { excludeExtraneousValues: true })
      newMsg.txId = txId;
      newMsg.typeUrl = msg.typeUrl;
      newMsg.amount = msg.value.amount[0]?.amount;
      return newMsg;
    })
    const result = await this.repos.save(newMsgs);
    return result;
  }
}
