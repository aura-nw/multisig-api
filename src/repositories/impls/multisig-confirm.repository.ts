import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ENTITIES_CONFIG, REPOSITORY_INTERFACE } from "src/module.config";
import { ObjectLiteral, Repository } from "typeorm";
import { IMultisigConfirmRepository } from "../imultisig-confirm.repository";
import { IMultisigWalletRepository } from "../imultisig-wallet.repository";
import { BaseRepository } from "./base.repository";

@Injectable()
export class MultisigConfirmRepository
    extends BaseRepository
    implements IMultisigConfirmRepository {
    private readonly _logger = new Logger(MultisigConfirmRepository.name)
    constructor(
        @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY) private safeRepos: IMultisigWalletRepository,
        @InjectRepository(ENTITIES_CONFIG.MULTISIG_CONFIRM)
        private readonly repos: Repository<ObjectLiteral>,
    ) {
        super(repos);
        this._logger.log(
            '============== Constructor Multisig Confirm Repository ==============',
        );
    }
    async validateOwner(ownerAddres: string, transactionAddress: string, internalChainId: number) {
        //Validate owner
      let listSafe = await this.safeRepos.getMultisigWalletsByOwner(ownerAddres, internalChainId);

      let result;

      listSafe.find(elelement => {
        if (elelement.safeAddress === transactionAddress){
          result = true;
        }
        else{
          result = false;
        }
      });
      
      return result;
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
        if (status) sqlQuerry.andWhere('multisigConfirm.status = :status', { status })
        return sqlQuerry.getRawMany();
    }
}
