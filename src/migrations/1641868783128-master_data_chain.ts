import {MigrationInterface, QueryRunner} from "typeorm";

export class masterDataChain1641868783128 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO Chain (Name, Rest, Rpc, Websocket) VALUES ('Localhost', 'http://0.0.0.0:1317', 'http://0.0.0.0:26657', 'ws://0.0.0.0:26657/websocket');
            INSERT INTO Chain (Name, Rest, Rpc, Websocket) VALUES ('Aura Testnet', 'http://18.138.28.51:1317', 'http://18.138.28.51:26657', 'ws://0.0.0.0:26657/websocket');
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM Chain WHERE Name = 'Localhost';
            DELETE FROM Chain WHERE Name = 'Aura Testnet';
        `)
    }

}
