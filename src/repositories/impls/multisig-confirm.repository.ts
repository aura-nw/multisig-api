import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Safe } from "src/entities";
import { ENTITIES_CONFIG } from "src/module.config";
import { ObjectLiteral, Repository } from "typeorm";
import { IMultisigConfirmRepository } from "../imultisig-confirm.repository";
import { BaseRepository } from "./base.repository";

@Injectable()
export class MultisigConfirmRepository 
    extends BaseRepository 
    implements IMultisigConfirmRepository {
        private readonly _logger = new Logger(MultisigConfirmRepository.name)
        constructor(
            @InjectRepository(ENTITIES_CONFIG.MULTISIG_CONFIRM)
            private readonly repos: Repository<ObjectLiteral>,
        ) {
            super(repos);
            this._logger.log(
                '============== Constructor Multisig Confirm Repository ==============',
              );
        }

        async getListConfirmMultisigTransaction(multisigTransactionId: number, status?: string) {
            let sqlQuerry = this.repos
                .createQueryBuilder('multisigConfirm')
                .where('multisigConfirm.multisigTransactionId = :multisigTransactionId', { multisigTransactionId })
                .select([
                    'multisigConfirm.id as id',
                    'multisigConfirm.createdAt as createdAt',
                    'multisigConfirm.updatedAt as updatedAt',
                    'multisigConfirm.ownerAddress as ownerAddress',
                    'multisigConfirm.signature as signature',
                    'multisigConfirm.status as status',
                ])
                .orderBy('multisigConfirm.createdAt', 'ASC');
            if(status) sqlQuerry.andWhere('multisigConfirm.status = :status', { status })
            let resultData = await sqlQuerry.getRawMany();
            return resultData;
        }
    }
