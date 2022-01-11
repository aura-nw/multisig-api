import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ENTITIES_CONFIG } from "src/module.config";
import { ObjectLiteral, Repository } from "typeorm";
import { ITransactionRepository } from "../itransaction.repository";
import { BaseRepository } from "./base.repository";

export class TransactionRepository extends BaseRepository implements ITransactionRepository {
    private readonly _logger = new Logger(TransactionRepository.name);
    constructor(
        @InjectRepository(ENTITIES_CONFIG.MULTISIG_CONFIRM)
        private readonly multisigConfirmRepos: Repository<ObjectLiteral>,
        @InjectRepository(ENTITIES_CONFIG.MULTISIG_TRANSACTION)
        private readonly multisigTransactionRepos: Repository<ObjectLiteral>,
    ) {
        super(multisigConfirmRepos);
    }
    
    async getListConfirmMultisigTransaction(multisigTransactionId: number) {
        let sqlQuerry = this.multisigConfirmRepos
            .createQueryBuilder('multisigConfirm')
            .where('multisigConfirm.multisigTransactionId = :multisigTransactionId', { multisigTransactionId })
            .select([
                'multisigConfirm.id as id',
                'multisigConfirm.createdAt as createdAt',
                'multisigConfirm.updatedAt as updatedAt',
                'multisigConfirm.ownerAddress as ownerAddress',
                'multisigConfirm.multisigTransactionId as multisigTransactionId',
                'multisigConfirm.bodyBytes as bodyBytes',
                'multisigConfirm.signature as signature',
                'multisigConfirm.chainId as chainId',
            ]);
        let resultData = await sqlQuerry.getRawMany();
        return resultData;
    }

    async getMultisigTxId(internalTxHash: string) {
        let sqlQuerry = this.multisigTransactionRepos
            .createQueryBuilder('multisigTransaction')
            .where('multisigTransaction.txHash = :internalTxHash', { internalTxHash })
            .select([
                'multisigTransaction.id as id',
            ]);
        let resultData = await sqlQuerry.getOne();
        return resultData;
    }
}