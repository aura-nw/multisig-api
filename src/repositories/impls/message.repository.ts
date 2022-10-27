import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import { TxMessageResponse } from '../../dtos/responses/message/tx-msg.response';
import { Message } from '../../entities';
import { ENTITIES_CONFIG } from '../../module.config';
import { Repository } from 'typeorm';
import { IMessageRepository } from '../imessage.repository';
import { BaseRepository } from './base.repository';
import { TxMessageHistoryResponse } from '../../dtos/responses';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';

@Injectable()
export class MessageRepository
  extends BaseRepository
  implements IMessageRepository
{
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
      const newMsg = plainToClass(Message, msg.value, {
        excludeExtraneousValues: true,
      });
      newMsg.txId = txId;
      newMsg.typeUrl = msg.typeUrl;
      newMsg.amount = msg.value.amount ? msg.value.amount[0]?.amount : null;
      return newMsg;
    });
    const result = await this.repos.save(newMsgs);
    return result;
  }

  async getMsgsByTxId(txId: number): Promise<TxMessageResponse[]> {
    const result = await this.repos.find({
      where: { txId },
    });
    return plainToInstance(TxMessageResponse, result, {
      excludeExtraneousValues: true,
    });
  }

  async getMsgsByAuraTxId(auraTxId: number): Promise<TxMessageResponse[]> {
    const result = await this.repos.find({
      where: { auraTxId },
    });
    return plainToInstance(TxMessageResponse, result, {
      excludeExtraneousValues: true,
    });
  }

  async getMessagesFromTxIds(txIds: number[]): Promise<TxMessageHistoryResponse[]> {
    const result = await this.repos
      .createQueryBuilder('message')
      .where('message.auraTxID IN (:txIds)', { txIds })
      .select([
        'message.auraTxID as AuraTxID',
        'sum(message.amount) as Amount',
      ])
      .groupBy('message.auraTxID')
      .getRawMany();
    if (!result) throw new CustomError(ErrorMap.MESSAGE_NOT_EXIST);
    return result;
  }
}
