import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CustomError } from '../../common/custom-error';
import { ErrorMap } from '../../common/error.map';
import { TxTypeUrl } from '../../common/constants/app.constant';
import { Message } from './entities/message.entity';
import { TxMessageResponseDto } from './dto';
import { TxMessageHistoryResponseDto } from './dto/response/tx-message-history.res';
import { IMessageUnknown } from '../../interfaces';

@Injectable()
export class MessageRepository {
  private readonly logger = new Logger(MessageRepository.name);

  constructor(
    @InjectRepository(Message)
    private readonly repos: Repository<Message>,
  ) {
    this.logger.log(
      '============== Constructor Message Repository ==============',
    );
  }

  async saveMsgs(txId: number, msgs: IMessageUnknown[]): Promise<Message[]> {
    const newMsgs: Message[] = [];
    for (const msg of msgs) {
      if (msg.value instanceof Uint8Array) {
        this.logger.log('Unexpected type Uint8Array of msg.value');
      } else {
        const newMsg = plainToClass(Message, msg.value, {
          excludeExtraneousValues: true,
        });
        newMsg.txId = txId;
        newMsg.typeUrl = msg.typeUrl;
        switch (msg.typeUrl) {
          case TxTypeUrl.SEND: {
            newMsg.amount =
              msg.value.amount && Array.isArray(msg.value.amount)
                ? msg.value.amount[0].amount
                : undefined;
            break;
          }
          case TxTypeUrl.MULTI_SEND: {
            newMsg.inputs = JSON.stringify(msg.value.inputs);
            newMsg.outputs = JSON.stringify(msg.value.outputs);
            break;
          }
          case TxTypeUrl.DELEGATE:
          case TxTypeUrl.REDELEGATE:
          case TxTypeUrl.UNDELEGATE: {
            newMsg.amount =
              msg.value.amount && !Array.isArray(msg.value.amount)
                ? msg.value.amount?.amount
                : undefined;
            break;
          }
          default: {
            break;
          }
        }
        newMsg.voteOption = msg.value.option || undefined;
        newMsg.proposalId = msg.value.proposalId
          ? Number(msg.value.proposalId)
          : undefined;
        newMsgs.push(newMsg);
      }
    }
    const result = await this.repos.save(newMsgs);
    return result;
  }

  async getMsgsByTxId(txId: number): Promise<TxMessageResponseDto[]> {
    const result = await this.repos.find({
      where: { txId },
    });
    return plainToInstance(TxMessageResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  async getMsgsByAuraTxId(auraTxId: number): Promise<TxMessageResponseDto[]> {
    if (!auraTxId) return [];
    const result = await this.repos.find({
      where: { auraTxId },
    });
    return plainToInstance(TxMessageResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
