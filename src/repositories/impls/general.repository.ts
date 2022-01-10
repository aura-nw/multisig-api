import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ENTITIES_CONFIG } from "src/module.config";
import { ObjectLiteral, Repository } from "typeorm";
import { IGeneralRepository } from "../igeneral.repository";
import { BaseRepository } from "./base.repository";

export class GeneralRepository extends BaseRepository implements IGeneralRepository {
    private readonly _logger = new Logger(GeneralRepository.name);
    constructor(
        @InjectRepository(ENTITIES_CONFIG.CHAIN)
        private readonly repos: Repository<ObjectLiteral>,
    ) {
        super(repos);
    }
    
    async showNetworkList() {
        let sqlQuerry = this.repos
            .createQueryBuilder('chain')
            .select([
                'chain.name as name',
                'chain.rest as rest',
                'chain.rpc as rpc',
            ]);
        let resultData = await sqlQuerry.getRawMany();
        return resultData;
    }
}