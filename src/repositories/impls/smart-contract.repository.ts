import { Inject, Injectable, Logger } from "@nestjs/common";
import { TRANSACTION_STATUS } from "src/common/constants/app.constant";
import { CustomError } from "src/common/customError";
import { ErrorMap } from "src/common/error.map";
import { REPOSITORY_INTERFACE } from "src/module.config";
import { ObjectLiteral, Repository } from "typeorm";
import { ISmartContractRepository } from "../ismart-contract.repository";
import { BaseRepository } from "./base.repository";

@Injectable()
export class SmartContractRepository extends BaseRepository implements ISmartContractRepository {
    private readonly _logger = new Logger(SmartContractRepository.name);
    constructor(
        @Inject(REPOSITORY_INTERFACE.ISMART_CONTRACT_REPOSITORY)
        private repos: Repository<ObjectLiteral>,
    ) {
        super(repos);
        this._logger.log(
            '============== Constructor Smart Contract Repository ==============',
        );
    }

    async validateCreateTx(from: string): Promise<any> {
        let sqlQuerry = this.repos
            .createQueryBuilder('smartContractTx')
            .where('smartContractTx.fromAddress = :from', { from })
            .andWhere(`smartContractTx.status in ('${TRANSACTION_STATUS.AWAITING_CONFIRMATIONS}', '${TRANSACTION_STATUS.AWAITING_EXECUTION}')`)
            .select(['smartContractTx.id as id']);

        let smartContractTx = await sqlQuerry.getCount();

        if (smartContractTx > 1)
            throw new CustomError(ErrorMap.SAFE_HAS_PENDING_TX);
    }
}