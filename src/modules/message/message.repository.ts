import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { fromUtf8 } from '@cosmjs/encoding';
import { TxTypeUrl } from '../../common/constants/app.constant';
import { Message } from './entities/message.entity';
import { TxMessageResponseDto } from './dto';
import { IMessageUnknown, IUnknownValue } from '../../interfaces';
import { CommonUtil } from '../../utils/common.util';

@Injectable()
export class MessageRepository {
  private readonly logger = new Logger(MessageRepository.name);

  private utils: CommonUtil = new CommonUtil();

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
        const newMsg = this.buildMsgBaseOnTypeUrl(msg.typeUrl, msg.value);
        newMsg.txId = txId;
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
    return plainToInstance(
      TxMessageResponseDto,
      result.map((item) => this.utils.omitByNil(item)),
      {
        excludeExtraneousValues: true,
      },
    );
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

  private getAmountFromUnknownValue(value: IUnknownValue): string {
    return value.amount && Array.isArray(value.amount)
      ? value.amount[0].amount
      : undefined;
  }

  private buildMsgBaseOnTypeUrl(
    typeUrl: string,
    value: IUnknownValue,
  ): Message {
    const newMsg = plainToClass(Message, value, {
      excludeExtraneousValues: true,
    });
    newMsg.typeUrl = typeUrl;
    switch (typeUrl) {
      case TxTypeUrl.SEND: {
        newMsg.amount = this.getAmountFromUnknownValue(value);
        break;
      }
      case TxTypeUrl.MULTI_SEND: {
        newMsg.inputs = JSON.stringify(value.inputs);
        newMsg.outputs = JSON.stringify(value.outputs);
        break;
      }
      case TxTypeUrl.DELEGATE:
      case TxTypeUrl.REDELEGATE:
      case TxTypeUrl.UNDELEGATE: {
        newMsg.amount =
          value.amount && !Array.isArray(value.amount)
            ? value.amount?.amount
            : undefined;
        break;
      }
      case TxTypeUrl.EXECUTE_CONTRACT: {
        newMsg.contractSender = value.sender;
        newMsg.contractAddress = value.contract;
        newMsg.contractFunds = value.funds.toString();

        if (value.msg instanceof Uint8Array) {
          const decodedMsg = fromUtf8(value.msg);

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const objectMsg = JSON.parse(decodedMsg);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          [newMsg.contractFunction] = Object.keys(objectMsg);
          if (newMsg.contractFunction) {
            newMsg.contractArgs = JSON.stringify(
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              objectMsg[newMsg.contractFunction],
            );
          }
        }

        break;
      }
      default: {
        break;
      }
    }
    newMsg.voteOption = value.option || undefined;
    newMsg.proposalId = value.proposalId ? Number(value.proposalId) : undefined;
    return newMsg;
  }
}
