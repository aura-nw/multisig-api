import {MigrationInterface, QueryRunner} from "typeorm";

export class addSenerityChain1651111196254 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        INSERT INTO Chain (Name, Rest, Rpc, Websocket, Explorer, Symbol, Denom, Prefix, ChainId) VALUES ('Serenity Testnet', 'https://lcd.serenity.aura.network', 'https://rpc.serenity.aura.network', 'wss://rpc.serenity.aura.network/websocket', 'https://serenity.aurascan.io', 'AURA', 'uaura', 'aura', 'serenity-testnet-001');
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
