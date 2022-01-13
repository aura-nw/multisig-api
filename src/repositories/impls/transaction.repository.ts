import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
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

    async getAuraTx(safeAddress: string) {
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
            .orderBy('auraTx.createdAt', 'DESC');
        let resultData = await sqlQuerry.getRawMany();
        return resultData;
    }
}