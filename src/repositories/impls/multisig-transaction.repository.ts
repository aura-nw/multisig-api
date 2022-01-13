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
}
