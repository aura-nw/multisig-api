import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { getManager, ObjectLiteral, Repository } from 'typeorm';
import { ENTITIES_CONFIG } from 'src/module.config';
import { IMultisigTransactionsRepository } from '../imultisig-transaction.repository';
import { Safe } from 'src/entities';

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
  }

async getMultisigTxId(internalTxHash: string) {
    let sqlQuerry = this.repos
        .createQueryBuilder('multisigTransaction')
        .where('multisigTransaction.txHash = :internalTxHash', { internalTxHash })
        .select([
            'multisigTransaction.id as id',
        ]);
    let resultData = await sqlQuerry.getOne();
    return resultData;
}

async getTransactionHistory(safeAddress: string) {
  const entityManager = getManager();
  const sqlQuerry = entityManager.query(`
    SELECT mt.Id, mt.CreatedAt, mt.UpdatedAt, mt.FromAddress, mt.ToAddress, mt.TxHash, mt.Amount, mt.Denom
    FROM MultisigTransaction mt INNER JOIN Safe s
    UNION ALL
    SELECT a.Id, a.CreatedAt, a.UpdatedAt, a.FromAddress, a.ToAddress, a.TxHash, a.Amount, a.Denom
    FROM AuraTx a;`);
    return sqlQuerry;
}
}
