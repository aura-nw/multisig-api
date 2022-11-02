import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import {
  TRANSACTION_STATUS,
  TRANSFER_DIRECTION,
} from '../../common/constants/app.constant';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import { MultisigTransactionHistoryResponse } from '../../dtos/responses';
import { TxDetailResponse } from '../../dtos/responses/multisig-transaction/tx-detail.response';
import { Chain } from '../../entities';
import { ENTITIES_CONFIG } from '../../module.config';
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
      SELECT AT.Id as AuraTxId, MT.Id as MultisigTxId, AT.TxHash as TxHash, MT.TypeUrl as TypeUrl, AT.FromAddress as FromAddress, AT.Amount as AuraTxAmount, MT.Amount as MultisigTxAmount, AT.Code as Status, AT.UpdatedAt as UpdatedAt FROM AuraTx AT
        LEFT JOIN MultisigTransaction MT on AT.TxHash = MT.TxHash
        WHERE AT.InternalChainId = ?
        AND  (AT.FromAddress = ? OR AT.ToAddress = ?)
      UNION
      SELECT NULL as AuraTxId,  MT.ID as MultisigTxId, MT.TxHash as TxHash, MT.TypeUrl as TypeUrl, MT.FromAddress as FromAddress, NULL as AuraTxAmount, MT.Amount as MultisigTxAmount, MT.Status, MT.UpdatedAt as UpdateAt  FROM MultisigTransaction MT
        WHERE MT.InternalChainId = ?
        AND MT.FromAddress = ?
        AND (Status = ? OR Status = ? OR Status = ?)
        AND TxHash IS NULL
      ORDER BY UpdatedAt DESC
      LIMIT ? OFFSET ?;
      `,
      [
        internalChainId,
        safeAddress,
        safeAddress,
        internalChainId,
        safeAddress,
        TRANSACTION_STATUS.CANCELLED,
        TRANSACTION_STATUS.SUCCESS,
        TRANSACTION_STATUS.FAILED,
        limit,
        offset,
      ],
    );

    const txs = plainToInstance(MultisigTransactionHistoryResponse, result);
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
        'auraTx.txHash as TxHash',
        'auraTx.gasUsed as GasUsed',
        'auraTx.gasWanted as GasWanted',
        'auraTx.fee as GasPrice',
        'auraTx.denom as Denom',
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
