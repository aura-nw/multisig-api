import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { off } from "process";
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

    async getAuraTx(safeAddress: string, page: number) {
        const limit = 20;
        const offset = limit * (page - 1);
        let sqlQuerry = this.repos
            .createQueryBuilder('auraTx')
            .where('auraTx.fromAddress = :safeAddress', { safeAddress })
            .orWhere('auraTx.toAddress = :safeAddress', { safeAddress })
            .select([
                'auraTx.id as id',
                'auraTx.createdAt as createdAt',
                'auraTx.updatedAt as updatedAt',
                'auraTx.fromAddress as fromAddress',
                'auraTx.toAddress as toAddress',
                'auraTx.txHash as txHash',
                'auraTx.amount as amount',
                'auraTx.denom as denom',
            ])
            .limit(limit).offset(offset)
            .orderBy('auraTx.createdAt', 'DESC');
        let resultData = await sqlQuerry.getRawMany();
        return resultData;
    }
}