import {MigrationInterface, QueryRunner} from "typeorm";

export class addChainOsmosisTestnet1645612887623 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO Chain (Name, Rest, Rpc, Websocket, Denom, Prefix, ChainId) VALUES ('Osmosis Testnet', 'https://osmosistest-lcd.quickapi.com/swagger/', 'https://testnet-rpc.osmosis.zone/', 'wss://testnet-rpc.osmosis.zone/websocket', 'uosmo', 'osmo', 'osmo-test-3');
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
