import {MigrationInterface, QueryRunner} from "typeorm";

export class addChainOsmosis1645598278162 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO Chain (Name, Rest, Rpc, Websocket, Denom, Prefix, ChainId) VALUES ('Osmosis Testnet', 'https://testnet-rest.osmosis.zone/', 'https://testnet-rpc.osmosis.zone/', 'wss://testnet-rpc.osmosis.zone/websocket', 'uosmo', 'osmo', 'osmo-test-3');
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
