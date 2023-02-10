import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MULTISIG_CONFIRM_STATUS } from '../../common/constants/app.constant';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import {
  MultisigConfirm,
  MultisigTransaction,
  Safe,
  SafeOwner,
} from '../../entities';
import { Repository } from 'typeorm';
import { SafeRepository } from '../safe/safe.repository';
import { plainToInstance } from 'class-transformer';
import { GetListConfirmResDto } from './dto/res/get-list-confirm.res';
import { GetListConfirmWithPubkey } from './dto/res/get-list-confirm-with-pubkey.res';

@Injectable()
export class MultisigConfirmRepository {
  private readonly _logger = new Logger(MultisigConfirmRepository.name);
  constructor(
    private safeRepo: SafeRepository,
    @InjectRepository(MultisigConfirm)
    private readonly repo: Repository<MultisigConfirm>,
  ) {
    this._logger.log(
      '============== Constructor Multisig Confirm Repository ==============',
    );
  }

  async insertIntoMultisigConfirm(
    multisigTransactionId: number,
    ownerAddress: string,
    signature: string,
    bodyBytes: string,
    internalChainId: number,
    status: string,
  ) {
    const multisigConfirm = new MultisigConfirm();
    multisigConfirm.multisigTransactionId = multisigTransactionId;
    multisigConfirm.ownerAddress = ownerAddress;
    multisigConfirm.signature = signature;
    multisigConfirm.bodyBytes = bodyBytes;
    multisigConfirm.internalChainId = internalChainId;
    multisigConfirm.status = status;

    await this.repo.save(multisigConfirm);
  }

  async checkUserHasSigned(
    transactionId: number,
    ownerAddress: string,
  ): Promise<void> {
    const confirmed = await this.repo.findOne({
      where: {
        multisigTransactionId: transactionId,
        ownerAddress: ownerAddress,
      },
    });

    if (confirmed) {
      throw new CustomError(ErrorMap.USER_HAS_COMFIRMED);
    }
  }

  async validateSafeOwner(
    ownerAddress: string,
    safeAddress: string,
    internalChainId: number,
  ): Promise<void> {
    //Validate owner
    const listSafe = await this.safeRepo.getMultisigWalletsByOwner(
      ownerAddress,
      internalChainId,
    );

    const result = listSafe.find((safe) => safe.safeAddress === safeAddress);

    if (!result) {
      throw new CustomError(ErrorMap.PERMISSION_DENIED);
    }
  }

  async getListConfirmMultisigTransaction(
    txId?: number,
    txHash?: string,
    status?: string,
  ): Promise<GetListConfirmResDto[]> {
    const sqlQuerry = this.repo
      .createQueryBuilder('multisigConfirm')
      .select([
        'multisigConfirm.id as id',
        'multisigConfirm.createdAt as createdAt',
        'multisigConfirm.updatedAt as updatedAt',
        'multisigConfirm.ownerAddress as ownerAddress',
        'multisigConfirm.signature as signature',
        'multisigConfirm.status as status',
      ])
      .orderBy('multisigConfirm.createdAt', 'ASC');
    if (txId) {
      sqlQuerry.where(
        'multisigConfirm.multisigTransactionId = :multisigTransactionId',
        {
          multisigTransactionId: txId,
        },
      );
    } else {
      sqlQuerry
        .innerJoin(
          MultisigTransaction,
          'multisigTransaction',
          'multisigConfirm.multisigTransactionId = multisigTransaction.id',
        )
        .where('multisigTransaction.txHash = :txHash', {
          txHash,
        });
    }
    if (status)
      sqlQuerry.andWhere('multisigConfirm.status = :status', { status });
    else
      sqlQuerry.andWhere('multisigConfirm.status IN (:...status)', {
        status: [
          MULTISIG_CONFIRM_STATUS.CONFIRM,
          MULTISIG_CONFIRM_STATUS.REJECT,
        ],
      });
    const result = await sqlQuerry.getRawMany();
    return plainToInstance(GetListConfirmResDto, result);
  }

  async getListConfirmWithPubkey(
    multisigTransactionId: number,
    status: string,
    safeId: number,
  ): Promise<GetListConfirmWithPubkey[]> {
    const sqlQuerry = this.repo
      .createQueryBuilder('multisigConfirm')
      .innerJoin(
        SafeOwner,
        'safeOwner',
        'multisigConfirm.ownerAddress = safeOwner.ownerAddress',
      )
      .innerJoin(Safe, 'safe', 'safe.id = safeOwner.safeId')
      .where('multisigConfirm.multisigTransactionId = :multisigTransactionId', {
        multisigTransactionId,
      })
      .andWhere('multisigConfirm.status = :status', { status })
      .andWhere('safeOwner.safeId = :safeId', { safeId })
      .select([
        'multisigConfirm.signature as signature',
        'safeOwner.ownerPubkey as pubkey',
      ]);
    const result = await sqlQuerry.getRawMany();
    return plainToInstance(GetListConfirmWithPubkey, result);
  }
}
