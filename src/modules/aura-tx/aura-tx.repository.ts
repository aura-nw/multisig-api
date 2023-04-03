import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { MoreThan, Repository } from 'typeorm';
import { CustomError } from '../../common/custom-error';
import { ErrorMap } from '../../common/error.map';
import { TxDetailDto } from '../multisig-transaction/dto/response/tx-detail.res';
import { MultisigTransaction } from '../multisig-transaction/entities/multisig-transaction.entity';
import { BatchAuraTxDto } from './dto';
import { AuraTx } from './entities/aura-tx.entity';

@Injectable()
export class AuraTxRepository {
  private readonly logger = new Logger(AuraTxRepository.name);

  constructor(
    @InjectRepository(AuraTx)
    private readonly repo: Repository<AuraTx>,
  ) {
    this.logger.log(
      '============== Constructor Aura Transaction Repository ==============',
    );
  }

  async getBatchTx(take: number, skip: number): Promise<BatchAuraTxDto[]> {
    const result = await this.repo
      .createQueryBuilder('AuraTx')
      .take(take)
      .where({
        id: MoreThan(skip),
      })
      .select([
        'AuraTx.fromAddress as fromAddress',
        'AuraTx.toAddress as toAddress',
        'AuraTx.txHash as txHash',
        'AuraTx.createdAt as createdAt',
        'AuraTx.internalChainId as internalChainId',
      ])
      .getRawMany();
    return plainToInstance(BatchAuraTxDto, result);
  }

  async getAuraTxDetail(auraTxId: number): Promise<TxDetailDto> {
    const tx = await this.repo
      .createQueryBuilder('AT')
      .leftJoin(MultisigTransaction, 'MT', 'AT.TxHash = MT.TxHash')
      .where('AT.Id = :auraTxId', { auraTxId })
      .select([
        'AT.Id as AuraTxId',
        'MT.Id as MultisigTxId',
        'AT.TxHash as TxHash',
        'AT.Fee as Fee',
        'AT.GasWanted as Gas',
        'AT.Code as Status',
        'MT.Sequence as Sequence',
        'AT.CreatedAt as CreatedAt',
        'AT.UpdatedAt as UpdatedAt',
        'AT.Timestamp as Timestamp',
      ])
      .getRawOne<TxDetailDto>();

    if (!tx) throw new CustomError(ErrorMap.TRANSACTION_NOT_EXIST);
    return tx;
  }
}
