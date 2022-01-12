import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ENTITIES_CONFIG } from "src/module.config";
import { ObjectLiteral, Repository } from "typeorm";
import { IGeneralRepository } from "../igeneral.repository";
import { BaseRepository } from "./base.repository";

@Injectable()
export class GeneralRepository extends BaseRepository implements IGeneralRepository {
    private readonly _logger = new Logger(GeneralRepository.name);
    constructor(
        @InjectRepository(ENTITIES_CONFIG.CHAIN)
        private readonly repos: Repository<ObjectLiteral>,
    ) {
        super(repos);
        this._logger.log(
            '============== Constructor General Repository ==============',
          );
    }
    
    async showNetworkList() {
        let sqlQuerry = this.repos
            .createQueryBuilder('chain')
            .select([
                'chain.id as id',
                'chain.name as name',
                'chain.rest as rest',
                'chain.rpc as rpc',
            ]);
        let resultData = await sqlQuerry.getRawMany();
        return resultData;
    }
}