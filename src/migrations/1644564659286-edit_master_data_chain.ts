import {MigrationInterface, QueryRunner} from "typeorm";

export class editMasterDataChain1644564659286 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO Chain (Name, Rest, Rpc, Websocket, Denom, ChainId) VALUES ('Vega Testnet', 'http://198.50.215.1:4317', 'http://198.50.215.1:46657', 'http://198.50.215.1:46657/websocket', 'uatom', 'vega-testnet');
            INSERT INTO Chain (Name, Rest, Rpc, Websocket, Denom, ChainId) VALUES ('Terra Testnet', 'https://bombay.stakesystems.io', 'https://bombay.stakesystems.io:2053', 'https://bombay.stakesystems.io:2053/websocket', 'uluna', 'bombay-12');
            INSERT INTO Chain (Name, Rest, Rpc, Websocket, Denom, ChainId) VALUES ('Juno Testnet (UNI)', 'https://lcd.uni.juno.deuslabs.fi', 'https://rpc.uni.juno.deuslabs.fi', 'https://rpc.uni.juno.deuslabs.fi/websocket', 'ujuno', 'uni-2');
            UPDATE Chain SET Denom = 'uaura' WHERE Name = 'Localhost';
            UPDATE Chain SET Denom = 'uaura' WHERE Name = 'Aura Testnet';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM Chain WHERE Name = 'Vega Testnet';
            DELETE FROM Chain WHERE Name = 'Terra Testnet';
            DELETE FROM Chain WHERE Name = 'Juno Testnet (Uni)';
        `)
    }

}
