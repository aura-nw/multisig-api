import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { In, ObjectLiteral, Repository } from 'typeorm';
import { ENTITIES_CONFIG, REPOSITORY_INTERFACE } from '../../module.config';
import { IMultisigTransactionsRepository } from '../imultisig-transaction.repository';
import { AuraTx, Chain, MultisigTransaction } from '../../entities';
import {
  MULTISIG_CONFIRM_STATUS,
  TRANSACTION_STATUS,
  TRANSFER_DIRECTION,
} from '../../common/constants/app.constant';
import { IMultisigConfirmRepository } from '../imultisig-confirm.repository';
import { IMultisigWalletRepository } from '../imultisig-wallet.repository';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import { plainToInstance } from 'class-transformer';
import { MultisigTransactionHistoryResponse } from '../../dtos/responses';
import {
  MultisigTxDetail,
  TxDetailResponse,
} from '../../dtos/responses/multisig-transaction/tx-detail.response';

@Injectable()
export class MultisigTransactionRepository
  extends BaseRepository
  implements IMultisigTransactionsRepository
{
  private readonly _logger = new Logger(MultisigTransactionRepository.name);
  constructor(
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY)
    private multisigConfirmRepos: IMultisigConfirmRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
    private safeRepos: IMultisigWalletRepository,
    @InjectRepository(ENTITIES_CONFIG.MULTISIG_TRANSACTION)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Multisig Transaction Repository ==============',
    );
  }

  async validateCreateTx(
    safeAddress: string,
    internalChainId: number,
  ): Promise<boolean> {
    const count = (
      await this.repos.findAndCount({
        where: {
          internalChainId,
          fromAddress: safeAddress,
          status: In([
            TRANSACTION_STATUS.AWAITING_CONFIRMATIONS,
            TRANSACTION_STATUS.AWAITING_EXECUTION,
          ]),
        },
        select: ['id'],
      })
    )[1];

    if (count > 0) throw new CustomError(ErrorMap.SAFE_HAS_PENDING_TX);
    return true;
  }

  async updateTxBroadcastSucces(
    transactionId: number,
    txHash: string,
  ): Promise<any> {
    const multisigTransaction = await this.findOne({
      where: {
        id: transactionId,
      },
    });

    multisigTransaction.status = TRANSACTION_STATUS.PENDING;
    multisigTransaction.txHash = txHash;
    await this.update(multisigTransaction);
  }

  async validateTxBroadcast(transactionId: number): Promise<any> {
    const multisigTransaction = await this.findOne({
      where: { id: transactionId },
    });

    if (
      !multisigTransaction ||
      multisigTransaction.status != TRANSACTION_STATUS.AWAITING_EXECUTION
    ) {
      throw new CustomError(ErrorMap.TRANSACTION_NOT_VALID);
    }

    return multisigTransaction;
  }

  async checkExistMultisigTransaction(transactionId: number): Promise<any> {
    const transaction = await this.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);
    }

    return transaction;
  }

  async insertMultisigTransaction(
    transaction: MultisigTransaction,
  ): Promise<any> {
    return this.create(transaction);
  }

  async validateTransaction(transactionId: number, internalChainId: number) {
    //Check transaction available
    const listConfirmAfterSign =
      await this.multisigConfirmRepos.findByCondition({
        multisigTransactionId: transactionId,
        status: MULTISIG_CONFIRM_STATUS.CONFIRM,
        internalChainId: internalChainId,
      });

    const transaction = await this.findOne({
      where: { id: transactionId, internalChainId: internalChainId },
    });

    const safe = await this.safeRepos.findOne({
      where: { id: transaction.safeId },
    });

    if (listConfirmAfterSign.length >= safe.threshold) {
      transaction.status = TRANSACTION_STATUS.AWAITING_EXECUTION;

      await this.update(transaction);
    }
  }

  async getMultisigTxId(internalTxHash: string) {
    const sqlQuerry = this.repos
      .createQueryBuilder('multisigTransaction')
      .where('multisigTransaction.txHash = :internalTxHash', { internalTxHash })
      .select(['multisigTransaction.id as id']);
    return sqlQuerry.getRawOne();
  }

  async getMultisigTxDetail(
    multisigTxId: number,
    auraTxId: number,
  ): Promise<MultisigTxDetail> {
    const select = [
      'AT.Id as AuraTxId',
      'MT.Id as MultisigTxId',
      'AT.TxHash as TxHash',
    ];

    const sqlQuerry = this.repos
      .createQueryBuilder('MT')
      .leftJoin(AuraTx, 'AT', 'MT.TxHash = AT.TxHash');

    if (multisigTxId) {
      select.push(
        ...[
          'MT.Status as Status',
          'MT.CreatedAt as CreatedAt',
          'MT.UpdatedAt as UpdatedAt',
        ],
      );
      sqlQuerry.where('MT.Id = :multisigTxId', { multisigTxId });
    } else {
      select.push(
        ...[
          'AT.Code as Status',
          'AT.CreatedAt as CreatedAt',
          'AT.UpdatedAt as UpdatedAt',
        ],
      );
      sqlQuerry.where('AT.Id = :auraTxId', { auraTxId });
    }

    sqlQuerry.select(select);

    const tx = await sqlQuerry.getRawOne();
    return plainToInstance(MultisigTxDetail, tx);
  }

  async getTransactionDetailsMultisigTransaction(
    condition: any,
  ): Promise<TxDetailResponse> {
    const param = condition.txHash ? condition.txHash : condition.id;
    const sqlQuerry = this.repos
      .createQueryBuilder('multisigTransaction')
      .innerJoin(
        Chain,
        'chain',
        'multisigTransaction.internalChainId = chain.id',
      )
      // .innerJoin(
      //   Safe,
      //   'safe',
      //   'multisigTransaction.fromAddress = safe.safeAddress',
      // )
      .select([
        'multisigTransaction.id as Id',
        'multisigTransaction.createdAt as CreatedAt',
        'multisigTransaction.updatedAt as UpdatedAt',
        'multisigTransaction.fromAddress as FromAddress',
        'multisigTransaction.toAddress as ToAddress',
        'multisigTransaction.txHash as TxHash',
        'multisigTransaction.amount as Amount',
        'multisigTransaction.denom as Denom',
        'multisigTransaction.status as Status',
        'multisigTransaction.gas as GasWanted',
        'multisigTransaction.fee as GasPrice',
        // 'safe.threshold as ConfirmationsRequired',
        // 'safe.creatorAddress as Signer',
        'chain.chainId as ChainId',
      ]);
    if (condition.txHash)
      sqlQuerry.where('multisigTransaction.txHash = :param', { param });
    else sqlQuerry.where('multisigTransaction.id = :param', { param });
    const result = await sqlQuerry.getRawOne();

    if (result) {
      const txDetail = plainToInstance(TxDetailResponse, result);
      txDetail.Direction = TRANSFER_DIRECTION.OUTGOING;

      return txDetail;
    }
    // throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);
    return result;
  }

  async getQueueTransaction(
    safeAddress: string,
    internalChainId: number,
    pageIndex: number,
    limit: number,
  ): Promise<MultisigTransactionHistoryResponse[]> {
    const offset = limit * (pageIndex - 1);
    const result: any[] = await this.repos.query(
      `
      SELECT Id, CreatedAt, UpdatedAt, Amount, Denom, TypeUrl, Status, ? AS Direction
      FROM MultisigTransaction
      WHERE FromAddress = ?
      AND (Status = ? OR Status = ? OR Status = ?)
      AND InternalChainId = ?
      ORDER BY UpdatedAt DESC
      LIMIT ? OFFSET ?
    `,
      [
        TRANSFER_DIRECTION.OUTGOING,
        safeAddress,
        TRANSACTION_STATUS.AWAITING_CONFIRMATIONS,
        TRANSACTION_STATUS.AWAITING_EXECUTION,
        TRANSACTION_STATUS.PENDING,
        internalChainId,
        limit,
        offset,
      ],
    );
    const txs = plainToInstance(MultisigTransactionHistoryResponse, result);
    return txs;
  }
}
