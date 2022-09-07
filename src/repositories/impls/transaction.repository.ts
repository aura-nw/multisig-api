import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import {
  TRANSACTION_STATUS,
  TRANSFER_DIRECTION,
} from 'src/common/constants/app.constant';
import { CustomError } from 'src/common/customError';
import { ErrorMap } from 'src/common/error.map';
import { MultisigTransactionHistoryResponse } from 'src/dtos/responses';
import { TxDetailResponse } from 'src/dtos/responses/multisig-transaction/tx-detail.response';
import { Chain } from 'src/entities';
import { ENTITIES_CONFIG } from 'src/module.config';
import { ObjectLiteral, Repository } from 'typeorm';
import { ITransactionRepository } from '../itransaction.repository';
import { BaseRepository } from './base.repository';

@Injectable()
export class TransactionRepository
  extends BaseRepository
  implements ITransactionRepository
{
  private readonly _logger = new Logger(TransactionRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.AURA_TX)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Transaction Repository ==============',
    );
  }

  async getAuraTx(
    safeAddress: string,
    internalChainId: number,
    pageIndex: number,
    limit: number,
  ) {
    const offset = limit * (pageIndex - 1);
    // query transactions from aura_tx
    // set direction of transaction
    const result: any[] = await this.repos.query(
      `
                SELECT Id, CreatedAt, UpdatedAt, FromAddress, ToAddress, TxHash, Amount, Denom, Code as Status, ? AS Direction
                FROM AuraTx
                WHERE ToAddress = ?
                AND InternalChainId = ?
                UNION
                SELECT Id, CreatedAt, UpdatedAt, FromAddress, ToAddress, TxHash, Amount, Denom, Status, ? AS Direction
                FROM MultisigTransaction
                WHERE FromAddress = ?
                AND (Status = ? OR Status = ? OR Status = ?)
                AND InternalChainId = ?
                ORDER BY UpdatedAt DESC
                LIMIT ? OFFSET ?;
            `,
      [
        TRANSFER_DIRECTION.INCOMING,
        safeAddress,
        internalChainId,
        TRANSFER_DIRECTION.OUTGOING,
        safeAddress,
        TRANSACTION_STATUS.SUCCESS,
        TRANSACTION_STATUS.CANCELLED,
        TRANSACTION_STATUS.FAILED,
        internalChainId,
        limit,
        offset,
      ],
    );
    const txs = plainToInstance(MultisigTransactionHistoryResponse, result);
    for (const tx of txs) {
      // Set status of transaction
      if (typeof tx.Status === 'number') {
        if (Number(tx.Status) === 0) tx.Status = TRANSACTION_STATUS.SUCCESS;
        else tx.Status = TRANSACTION_STATUS.FAILED;
      }
    }
    return txs;
  }

  async getTransactionDetailsAuraTx(txHash: string): Promise<TxDetailResponse> {
    const result = await this.repos
      .createQueryBuilder('auraTx')
      .innerJoin(Chain, 'chain', 'auraTx.internalChainId = chain.id')
      .where('auraTx.txHash = :txHash', { txHash })
      .select([
        'auraTx.id as Id',
        'auraTx.code as Code',
        'auraTx.createdAt as CreatedAt',
        'auraTx.updatedAt as UpdatedAt',
        'auraTx.fromAddress as FromAddress',
        'auraTx.toAddress as ToAddress',
        'auraTx.txHash as TxHash',
        'auraTx.amount as Amount',
        'auraTx.denom as Denom',
        'auraTx.gasUsed as GasUsed',
        'auraTx.gasWanted as GasWanted',
        'auraTx.fee as GasPrice',
        'chain.chainId as ChainId',
      ])
      .getRawOne();
    if (!result) throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);
    const txDetail = plainToInstance(TxDetailResponse, result);

    if (String(result.Code) === '0')
      txDetail.Status = TRANSACTION_STATUS.SUCCESS;
    else txDetail.Status = TRANSACTION_STATUS.FAILED;
    txDetail.Direction = TRANSFER_DIRECTION.INCOMING;

    return txDetail;
  }
}
