import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { off } from "process";
import { TRANSACTION_STATUS } from "src/common/constants/app.constant";
import { Chain, Safe } from "src/entities";
import { ENTITIES_CONFIG, MODULE_REQUEST } from "src/module.config";
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

    async getAuraTx(request: MODULE_REQUEST.GetAllTransactionsRequest) {
        const limit = request.pageSize;
        const offset = limit * (request.pageIndex - 1);
        return this.repos
            .query(`
                SELECT Id, CreatedAt, UpdatedAt, FromAddress, ToAddress, TxHash, Amount, Denom, Code as Status
                FROM AuraTx
                WHERE (FromAddress = ? OR ToAddress = ?)
                UNION
                SELECT Id, CreatedAt, UpdatedAt, FromAddress, ToAddress, TxHash, Amount, Denom, Status
                FROM MultisigTransaction
                WHERE (FromAddress = ? OR ToAddress = ?)
                AND (Status = ? OR Status = ?)
                ORDER BY CreatedAt DESC
                LIMIT ? OFFSET ?;
            `, [request.safeAddress, request.safeAddress, request.safeAddress, request.safeAddress, TRANSACTION_STATUS.CANCELLED, TRANSACTION_STATUS.FAILED, limit, offset]);
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
                'auraTx.fee as GasPrice',
                'chain.chainId as ChainId'
            ]);
        return sqlQuerry.getRawOne();
    }
}