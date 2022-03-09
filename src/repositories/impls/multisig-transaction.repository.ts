import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { ObjectLiteral, Repository } from 'typeorm';
import { ENTITIES_CONFIG, MODULE_REQUEST, REPOSITORY_INTERFACE } from 'src/module.config';
import { IMultisigTransactionsRepository } from '../imultisig-transaction.repository';
import { Chain, MultisigTransaction, Safe } from 'src/entities';
import { MULTISIG_CONFIRM_STATUS, TRANSACTION_STATUS } from 'src/common/constants/app.constant';
import { IMultisigConfirmRepository } from '../imultisig-confirm.repository';
import { IMultisigWalletRepository } from '../imultisig-wallet.repository';
import { CustomError } from 'src/common/customError';
import { ErrorMap } from 'src/common/error.map';

@Injectable()
export class MultisigTransactionRepository
  extends BaseRepository
  implements IMultisigTransactionsRepository {
  private readonly _logger = new Logger(MultisigTransactionRepository.name);
  constructor(
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY) private multisigConfirmRepos: IMultisigConfirmRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY) private safeRepos: IMultisigWalletRepository,
    @InjectRepository(ENTITIES_CONFIG.MULTISIG_TRANSACTION)
    private readonly repos: Repository<ObjectLiteral>
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Multisig Transaction Repository ==============',
    );
  }

  async checkExistMultisigTransaction(transactionId: number, internalChainId: number): Promise<any> {
    let transaction = await this.findOne({
      where: { id: transactionId, internalChainId: internalChainId }
    });

    if (!transaction) {
      throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);
    }

    return transaction;
  }

  async insertMultisigTransaction(from: string, to: string, amount: number, gasLimit: number, fee: number, accountNumber: number, typeUrl: string, denom: string, status: string, internalChainId: number, sequence: string, safeId: number): Promise<any> {
      let transaction = new MultisigTransaction();

      transaction.fromAddress = from;
      transaction.toAddress = to;
      transaction.amount = amount;
      transaction.gas = gasLimit;
      transaction.fee = fee;
      transaction.accountNumber = accountNumber;
      transaction.typeUrl = typeUrl;
      transaction.denom = denom;
      transaction.status = status;
      transaction.internalChainId = internalChainId;
      transaction.sequence = sequence;
      transaction.safeId = safeId;

      return await this.create(transaction);
  }

  async validateTransaction(transactionId: number, internalChainId: number) {
    //Check transaction available
    let listConfirmAfterSign = await this.multisigConfirmRepos.findByCondition({
      multisigTransactionId: transactionId,
      status: MULTISIG_CONFIRM_STATUS.CONFIRM,
      internalChainId: internalChainId
    });

    let transaction = await this.findOne({
      where: { id: transactionId, internalChainId: internalChainId }
    });

    let safe = await this.safeRepos.findOne({
      where: { id: transaction.safeId },
    });

    if (listConfirmAfterSign.length >= safe.threshold) {
      transaction.status = TRANSACTION_STATUS.AWAITING_EXECUTION;

      await this.update(transaction);
    }
  }

  async getMultisigTxId(internalTxHash: string) {
    let sqlQuerry = this.repos
      .createQueryBuilder('multisigTransaction')
      .where('multisigTransaction.txHash = :internalTxHash', { internalTxHash })
      .select([
        'multisigTransaction.id as id',
      ]);
    return sqlQuerry.getRawOne();
  }

  async getTransactionDetailsMultisigTransaction(condition: any) {
    const param = condition.txHash ? condition.txHash : condition.id;
    let sqlQuerry = this.repos
      .createQueryBuilder('multisigTransaction')
      .innerJoin(Chain, 'chain', 'multisigTransaction.internalChainId = chain.id')
      .innerJoin(Safe, 'safe', 'multisigTransaction.fromAddress = safe.safeAddress')
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
        'safe.threshold as ConfirmationsRequired',
        'safe.creatorAddress as Signer',
        'chain.chainId as ChainId'
      ]);
    if (condition.txHash) sqlQuerry.where('multisigTransaction.txHash = :param', { param })
    else sqlQuerry.where('multisigTransaction.id = :param', { param })
    return sqlQuerry.getRawOne();
  }

  async getQueueTransaction(request: MODULE_REQUEST.GetAllTransactionsRequest) {
    const limit = request.pageSize;
    const offset = limit * (request.pageIndex - 1);
    return this.repos.query(`
      SELECT Id, CreatedAt, UpdatedAt, FromAddress, ToAddress, TxHash, Amount, Denom, Status
      FROM MultisigTransaction
      WHERE (FromAddress = ? OR ToAddress = ?)
      AND (Status = ? OR Status = ? OR Status = ?)
      ORDER BY CreatedAt DESC
      LIMIT ? OFFSET ?
    `, [request.safeAddress, request.safeAddress, TRANSACTION_STATUS.AWAITING_CONFIRMATIONS, TRANSACTION_STATUS.AWAITING_EXECUTION, TRANSACTION_STATUS.PENDING,
      limit, offset]);
  }
}
