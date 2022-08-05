import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import e from 'express';
import { MULTISIG_CONFIRM_STATUS } from 'src/common/constants/app.constant';
import { CustomError } from 'src/common/customError';
import { ErrorMap } from 'src/common/error.map';
import {
  MultisigConfirm,
  MultisigTransaction,
  Safe,
  SafeOwner,
} from 'src/entities';
import { ENTITIES_CONFIG, REPOSITORY_INTERFACE } from 'src/module.config';
import { ObjectLiteral, Repository } from 'typeorm';
import { IMultisigConfirmRepository } from '../imultisig-confirm.repository';
import { IMultisigWalletRepository } from '../imultisig-wallet.repository';
import { BaseRepository } from './base.repository';

@Injectable()
export class MultisigConfirmRepository
  extends BaseRepository
  implements IMultisigConfirmRepository
{
  private readonly _logger = new Logger(MultisigConfirmRepository.name);
  constructor(
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
    private safeRepos: IMultisigWalletRepository,
    @InjectRepository(ENTITIES_CONFIG.MULTISIG_CONFIRM)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Multisig Confirm Repository ==============',
    );
  }

  async insertIntoMultisigConfirmContractType(
    smartContractTxId: number,
    ownerAddress: string,
    signature: string,
    bodyBytes: string,
    internalChainId: number,
    status: string,
  ) {
    const multisigConfirm = new MultisigConfirm();
    multisigConfirm.smartContractTxId = smartContractTxId;
    multisigConfirm.ownerAddress = ownerAddress;
    multisigConfirm.signature = signature;
    multisigConfirm.bodyBytes = bodyBytes;
    multisigConfirm.internalChainId = internalChainId;
    multisigConfirm.status = status;

    await this.create(multisigConfirm);
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

    await this.create(multisigConfirm);
  }

  async checkUserHasSigned(
    transactionId: number,
    ownerAddress: string,
  ): Promise<any> {
    const listConfirm = await this.findByCondition({
      multisigTransactionId: transactionId,
      ownerAddress: ownerAddress,
    });

    if (listConfirm.length > 0) {
      throw new CustomError(ErrorMap.USER_HAS_COMFIRMED);
    }
  }

  async validateSafeOwner(
    ownerAddres: string,
    safeAddress: string,
    internalChainId: number,
  ): Promise<any> {
    //Validate owner
    const listSafe = await this.safeRepos.getMultisigWalletsByOwner(
      ownerAddres,
      internalChainId,
    );

    const result = listSafe.find((elelement) => {
      if (elelement.safeAddress === safeAddress) {
        return true;
      }
    });

    if (!result) {
      throw new CustomError(ErrorMap.PERMISSION_DENIED);
    }
  }

  async getListConfirmMultisigTransaction(
    txId?: number,
    txHash?: string,
    status?: string,
  ) {
    const sqlQuerry = this.repos
      .createQueryBuilder('multisigConfirm')
      // .where('multisigConfirm.multisigTransactionId = :multisigTransactionId', {
      //   multisigTransactionId,
      // })
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
    return sqlQuerry.getRawMany();
  }

  async getListConfirmWithPubkey(
    multisigTransactionId: number,
    status: string,
    safeId: number,
  ) {
    const sqlQuerry = this.repos
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
    return sqlQuerry.getRawMany();
  }
}
