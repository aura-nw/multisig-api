import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import { TxMessageDetailsResponse, TxMessageHistoryResponse } from '../../dtos/responses';
import { ENTITIES_CONFIG } from '../../module.config';
import { ObjectLiteral, Repository } from 'typeorm';
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
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor TxMessage Repository ==============',
    );
  }

  async getTxMessagesFromTxIds(txIds: number[]): Promise<TxMessageHistoryResponse[]> {
    const result = await this.repos
      .createQueryBuilder('txMessage')
      .where('txMessage.txID IN (:txIds)', { txIds })
      .select([
        'txMessage.txId as TxId',
        'sum(txMessage.amount) as Amount',
        'txMessage.denom as Denom',
      ])
      .groupBy('txMessage.txId')
      .getRawMany();
    if (!result) throw new CustomError(ErrorMap.TX_MESSAGE_NOT_EXIST);
    return result;
  }

  async getDetailTxMessagesByTxId(txId: number): Promise<TxMessageDetailsResponse[]> {
    const result = await this.repos
      .createQueryBuilder('txMessage')
      .where('txMessage.txID = :txId', { txId })
      .select([
        'txMessage.txId as TxId',
        'txMessage.fromAddress as FromAddress',
        'txMessage.toAddress as ToAddress',
        'txMessage.amount as Amount',
        'txMessage.denom as Denom',
      ])
      .getRawMany();
    if (!result) throw new CustomError(ErrorMap.TX_MESSAGE_NOT_EXIST);
    return result;
  }
}
