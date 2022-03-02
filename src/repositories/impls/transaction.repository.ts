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
        return this.repos
            .query(`
                SELECT Id, CreatedAt, UpdatedAt, FromAddress, ToAddress, TxHash, Amount, Denom, Status
                FROM MultisigTransaction
                WHERE FromAddress = ? OR ToAddress = ?
                UNION
                SELECT Id, CreatedAt, UpdatedAt, FromAddress, ToAddress, TxHash, Amount, Denom, Code
                FROM AuraTx
                WHERE FromAddress = ? OR ToAddress = ?
                ORDER BY CreatedAt ASC
                LIMIT ? OFFSET ?;
            `, [safeAddress, safeAddress, safeAddress, safeAddress, limit, offset]);
    }

    async getTransactionDetailsAuraTx(condition: any) {
        const txHash = condition.txHash;
        let sqlQuerry = this.repos
            .createQueryBuilder('auraTx')
            .innerJoin(Chain, 'chain', 'auraTx.internalChainId = chain.id')
            .where('auraTx.txHash = :txHash', { txHash })
            .select([
                'auraTx.id as Id',
                'auraTx.code as Code',
                'auraTx.createdAt as CreatedAt',
                'auraTx.updatedAt as UpdatedAt',
                'auraTx.fromAddress as FromAddress',
                'auraTx.toAddress as ToAddress',
                'auraTx.txHash as TxHash',
                'auraTx.amount as Amount',
                'auraTx.denom as Denom',
                'auraTx.gasUsed as GasUsed',
                'auraTx.gasWanted as GasWanted',
                'chain.chainId as ChainId'
            ]);
        return sqlQuerry.getRawOne();
    }
}