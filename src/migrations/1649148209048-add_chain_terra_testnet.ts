import {MigrationInterface, QueryRunner} from "typeorm";

export class addChainTerraTestnet1649148209048 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        INSERT INTO Chain (Name, Rest, Rpc, Websocket, Explorer, Symbol, Denom, Prefix, ChainId) VALUES ('Terra Testnet', 'https://bombay.stakesystems.io', 'https://bombay.stakesystems.io:2053', 'wss://bombay.stakesystems.io:2053/websocket', 'https://finder.terra.money/testnet/', 'LUNA', 'uluna', 'terra', 'bombay-12');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
