import { ConfigService } from "src/shared/services/config.service";
import {MigrationInterface, QueryRunner} from "typeorm";

export class updateChainAddExplorer1646618634443 implements MigrationInterface {
    private config: ConfigService = new ConfigService();
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE Chain ADD COLUMN Explorer varchar(45) NOT NULL AFTER Websocket;
            UPDATE Chain SET Explorer = 'https://explorer.aura.network/' WHERE Name = 'Aura Testnet';
            UPDATE Chain SET Explorer = 'https://vega-explorer.hypha.coop/' WHERE Name = 'Vega Testnet';
            UPDATE Chain SET Explorer = 'https://skynetexplorers.com/juno-uni-2/' WHERE Name = 'Juno Testnet';
            UPDATE Chain SET Explorer = 'https://bigdipper.testnet.osmo.mp20.net/' WHERE Name = 'Osmosis Testnet';
        `)
        if(this.config.isDevelopment) {
            await queryRunner.query(`
                UPDATE Chain SET Explorer = 'https://explorer.aura.network/' WHERE Name = 'Aura Devnet' OR Name = 'Localhost';   
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
