import { ConfigService } from "src/shared/services/config.service";
import {MigrationInterface, QueryRunner} from "typeorm";

export class updateChainAddSymbol1646123786581 implements MigrationInterface {
    private config: ConfigService = new ConfigService();
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE Chain ADD COLUMN Symbol varchar(45) NOT NULL AFTER Websocket;
            UPDATE Chain SET Symbol = 'AURA' WHERE Name = 'Aura Testnet';
            UPDATE Chain SET Symbol = 'ATOM' WHERE Name = 'Vega Testnet';
            UPDATE Chain SET Symbol = 'LUNA' WHERE Name = 'Terra Testnet';
            UPDATE Chain SET Symbol = 'JUNO' WHERE Name = 'Juno Testnet';
            UPDATE Chain SET Symbol = 'OSMO' WHERE Name = 'Osmosis Testnet';
        `);
        if(this.config.isDevelopment) {
            await queryRunner.query(`
            UPDATE Chain SET Symbol = 'AURA' WHERE Name = 'Aura Devnet' OR Name = 'Localhost';
        `);
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
