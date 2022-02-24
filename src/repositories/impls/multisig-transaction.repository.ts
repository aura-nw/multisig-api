import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { getManager, ObjectLiteral, Repository } from 'typeorm';
import { ENTITIES_CONFIG } from 'src/module.config';
import { IMultisigTransactionsRepository } from '../imultisig-transaction.repository';
import { Chain, Safe } from 'src/entities';

@Injectable()
export class MultisigTransactionRepository
  extends BaseRepository
  implements IMultisigTransactionsRepository
{
  private readonly _logger = new Logger(MultisigTransactionRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.MULTISIG_TRANSACTION) 
    private readonly repos: Repository<ObjectLiteral>
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Multisig Transaction Repository ==============',
    );
  }

  async getMultisigTxId(internalTxHash: string) {
      let sqlQuerry = this.repos
          .createQueryBuilder('multisigTransaction')
          .where('multisigTransaction.txHash = :internalTxHash', { internalTxHash })
          .select([
              'multisigTransaction.id as id',
          ]);
      let resultData = await sqlQuerry.getRawOne();
      return resultData;
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
          'safe.threshold as ConfirmationsRequired',
          'safe.creatorAddress as Signer',
          'chain.chainId as ChainId'
        ]);
    if(condition.txHash) sqlQuerry.where('multisigTransaction.txHash = :param', { param })
    else sqlQuerry.where('multisigTransaction.id = :param', { param })
    let resultData = await sqlQuerry.getRawOne();
    return resultData;
}
}
