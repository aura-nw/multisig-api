import {MigrationInterface, QueryRunner} from "typeorm";

export class addChainAuraDevnet1645585151086 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO Chain (Name, Rest, Rpc, Websocket, Denom, Prefix, ChainId) VALUES ('Aura Devnet', 'http://34.199.79.132:1317', 'http://34.199.79.132:26657', 'http://34.199.79.132:26657/websocket', 'uaura', 'aura', 'aura-testnet');
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
