import {MigrationInterface, QueryRunner} from "typeorm";

export class updateVegaRpcRest1647399007572 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE Chain SET Rest = 'https://vega-rest.interchain.io' WHERE Name = 'Vega Testnet';
            UPDATE Chain SET Rpc = 'https://vega-rpc.interchain.io' WHERE Name = 'Vega Testnet';
            UPDATE Chain SET Websocket = 'https://vega-rpc.interchain.io/websocket' WHERE Name = 'Vega Testnet';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
