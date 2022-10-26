import { TxMessageResponse } from '../dtos/responses/message/tx-msg.response';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { IBaseRepository } from './ibase.repository';

export interface IMessageRepository extends IBaseRepository {
  /**
   * saveMsgs
   * @param msgs
   */
  saveMsgs(txId: number, msgs: any[]): Promise<Message[]>;


  /**
   * getMsgsByTxId
   * @param txId 
   */
  getMsgsByTxId(txId: number): Promise<TxMessageResponse[]>

}
