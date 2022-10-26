import { TxMessageDetailsResponse, TxMessageHistoryResponse } from '../dtos/responses';
import { IBaseRepository } from './ibase.repository';

export interface ITxMessageRepository extends IBaseRepository {
    /**
    * Get all money flow of Txs
    * @param txIds
    */
    getTxMessagesFromTxIds(txIds: number[]): Promise<TxMessageHistoryResponse[]>;

    /**
    * Get all messages of a Tx
    * @param txId
    */
    getDetailTxMessagesByTxId(txId: number): Promise<TxMessageDetailsResponse[]>;
}
