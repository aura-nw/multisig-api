import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MULTISIG_CONFIRM_STATUS,
  TRANSACTION_STATUS,
} from 'src/common/constants/app.constant';
import { CustomError } from 'src/common/customError';
import { ErrorMap } from 'src/common/error.map';
import { SmartContractTx } from 'src/entities';
import { ENTITIES_CONFIG, REPOSITORY_INTERFACE } from 'src/module.config';
import { ObjectLiteral, Repository } from 'typeorm';
import { IMultisigConfirmRepository } from '../imultisig-confirm.repository';
import { IMultisigWalletRepository } from '../imultisig-wallet.repository';
import { ISmartContractRepository } from '../ismart-contract.repository';
import { BaseRepository } from './base.repository';

@Injectable()
export class SmartContractRepository
  extends BaseRepository
  implements ISmartContractRepository
{
  private readonly _logger = new Logger(SmartContractRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.SMART_CONTRACT_TX)
    private repos: Repository<ObjectLiteral>,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_CONFIRM_REPOSITORY)
    private multisigConfirmRepos: IMultisigConfirmRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
    private safeRepos: IMultisigWalletRepository,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Smart Contract Repository ==============',
    );
  }

  async validateCreateTx(from: string, internalChainId: number): Promise<any> {
    const sqlQuerry = this.repos
      .createQueryBuilder('smartContractTx')
      .where('smartContractTx.internalChainId = :internalChainId', {
        internalChainId,
      })
      .andWhere('smartContractTx.fromAddress = :from', { from })
      .andWhere(
        `smartContractTx.status in ('${TRANSACTION_STATUS.AWAITING_CONFIRMATIONS}', '${TRANSACTION_STATUS.AWAITING_EXECUTION}')`,
      )
      .select(['smartContractTx.id as id']);

    const smartContractTx = await sqlQuerry.getCount();

    if (smartContractTx > 1)
      throw new CustomError(ErrorMap.SAFE_HAS_PENDING_TX);
    return true;
  }

  async insertExecuteContract(contractTx: SmartContractTx): Promise<any> {
    return this.create(contractTx);
  }

  async checkExistSmartContractTx(
    smartContractTxId: number,
    internalChainId: number,
  ): Promise<any> {
    const transaction = await this.findOne({
      where: { id: smartContractTxId, internalChainId: internalChainId },
    });

    if (!transaction) throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);

    return transaction;
  }

  async validateTransaction(transactionId: number, internalChainId: number) {
    //Check transaction available
    const listConfirmAfterSign =
      await this.multisigConfirmRepos.findByCondition({
        smartContractTxId: transactionId,
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

  async validateTxBroadcast(transactionId: number): Promise<any> {
    const smartContractTx = await this.findOne({
      where: { id: transactionId },
    });

    if (
      !smartContractTx ||
      smartContractTx.status != TRANSACTION_STATUS.AWAITING_EXECUTION
    ) {
      throw new CustomError(ErrorMap.TRANSACTION_NOT_VALID);
    }

    return smartContractTx;
  }

  async updateTxBroadcastSucces(
    transactionId: number,
    txHash: string,
  ): Promise<any> {
    const smartContractTx = await this.findOne({
      where: {
        id: transactionId,
      },
    });

    smartContractTx.status = TRANSACTION_STATUS.PENDING;
    smartContractTx.txHash = txHash;
    await this.update(smartContractTx);
  }
}
