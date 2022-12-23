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
import { TX_TYPE_URL } from 'src/common/constants/app.constant';

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
      switch (msg.typeUrl) {
        case TX_TYPE_URL.SEND:
          newMsg.amount = msg.value.amount ? msg.value.amount[0].amount : null;
          break;
        case TX_TYPE_URL.MULTI_SEND:
          newMsg.inputs = JSON.stringify(msg.value.inputs);
          newMsg.outputs = JSON.stringify(msg.value.outputs);
          break;
        case TX_TYPE_URL.DELEGATE:
        case TX_TYPE_URL.REDELEGATE:
        case TX_TYPE_URL.UNDELEGATE:
          newMsg.amount = msg.value.amount ? msg.value.amount?.amount : null;
          break;
      }
      newMsg.voteOption = msg.value.option ? msg.value.option : null;
      newMsg.proposalId = msg.value.proposalId
        ? Number(msg.value.proposalId)
        : null;
      return newMsg;
    });
    const result = await this.repos.save(newMsgs);
    return result;
  }

  async getMsgsByTxId(txId: number): Promise<TxMessageResponse[]> {
    const result = await this.repos.find({
      where: { txId },
    });
    //  const formatMsg = this._commonUtil.omitByNil(result);
    return plainToInstance(TxMessageResponse, result, {
      excludeExtraneousValues: true,
    });
  }

  async getMsgsByAuraTxId(auraTxId: number): Promise<TxMessageResponse[]> {
    if (!auraTxId) return [];
    const result = await this.repos.find({
      where: { auraTxId },
    });
    return plainToInstance(TxMessageResponse, result, {
      excludeExtraneousValues: true,
    });
  }

  async getMessagesFromTxIds(
    txIds: number[],
  ): Promise<TxMessageHistoryResponse[]> {
    const result = await this.repos
      .createQueryBuilder('message')
      .where('message.auraTxID IN (:txIds)', { txIds })
      .select(['message.auraTxID as AuraTxID', 'sum(message.amount) as Amount'])
      .groupBy('message.auraTxID')
      .getRawMany();
    if (!result) throw new CustomError(ErrorMap.MESSAGE_NOT_EXIST);
    return result;
  }
}
