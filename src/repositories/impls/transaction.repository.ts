import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { off } from "process";
import { Chain, Safe } from "src/entities";
import { ENTITIES_CONFIG } from "src/module.config";
import { ObjectLiteral, Repository } from "typeorm";
import { ITransactionRepository } from "../itransaction.repository";
import { BaseRepository } from "./base.repository";

@Injectable()
export class TransactionRepository
    extends BaseRepository
    implements ITransactionRepository {
    private readonly _logger = new Logger(TransactionRepository.name);
    constructor(
        @InjectRepository(ENTITIES_CONFIG.AURA_TX)
        private readonly repos: Repository<ObjectLiteral>
    ) {
        super(repos);
        this._logger.log(
            '============== Constructor Transaction Repository ==============',
          );
    }

    async getAuraTx(safeAddress: string, pageIndex: number, pageSize: number) {
        const limit = pageSize;
        const offset = limit * (pageIndex - 1);
        // let sqlQuerry = this.repos
        //     .createQueryBuilder('auraTx')
        //     .where('auraTx.fromAddress = :safeAddress', { safeAddress })
        //     .orWhere('auraTx.toAddress = :safeAddress', { safeAddress })
        //     .select([
        //         'auraTx.id as id',
        //         'auraTx.createdAt as createdAt',
        //         'auraTx.updatedAt as updatedAt',
        //         'auraTx.fromAddress as fromAddress',
        //         'auraTx.toAddress as toAddress',
        //         'auraTx.txHash as txHash',
        //         'auraTx.amount as amount',
        //         'auraTx.denom as denom',
        //     ])
        //     .limit(limit).offset(offset)
        //     .orderBy('auraTx.createdAt', 'DESC');
        // let resultData = await sqlQuerry.getRawMany();
        let resultData = await this.repos
            .query(`
                SELECT Id, CreatedAt, UpdatedAt, FromAddress, ToAddress, TxHash, Amount, Denom, Status
                FROM MultisigTransaction
                WHERE FromAddress = ? OR ToAddress = ?
                UNION
                SELECT Id, CreatedAt, UpdatedAt, FromAddress, ToAddress, TxHash, Amount, Denom, Code
                FROM AuraTx
                WHERE FromAddress = ? OR ToAddress = ?
                LIMIT ? OFFSET ?;
            `, [ safeAddress, safeAddress, safeAddress, safeAddress, limit, offset ]);
        return resultData;
    }

    async getTransactionDetailsAuraTx(condition: any) {
        const txHash = condition.txHash;
        let sqlQuerry = this.repos
            .createQueryBuilder('auraTx')
            .innerJoin(Chain, 'chain', 'auraTx.internalChainId = chain.id')
            .innerJoin(Safe, 'safe', 'auraTx.fromAddress = safe.safeAddress')
            .where('auraTx.txHash = :txHash', { txHash })
            .select([
                'auraTx.id as Id',
                'auraTx.createdAt as CreatedAt',
                'auraTx.updatedAt as UpdatedAt',
                'auraTx.fromAddress as FromAddress',
                'auraTx.toAddress as ToAddress',
                'auraTx.txHash as TxHash',
                'auraTx.amount as Amount',
                'auraTx.denom as Denom',
                'auraTx.status as Status',
                'safe.threshold as ConfirmationsRequired',
                'safe.creatorAddress as Signer',
                //
                'chain.chainId as ChainId'
            ]);
        let resultData = await sqlQuerry.getRawOne();
        return resultData;
    }
}