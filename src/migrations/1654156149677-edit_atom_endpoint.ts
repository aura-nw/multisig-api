import {MigrationInterface, QueryRunner} from "typeorm";

export class editAtomEndpoint1654156149677 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE Chain SET Rest = 'https://rest-atom-testnet.aura.network/' WHERE Name = 'Gaia Testnet';
            UPDATE Chain SET Rpc = 'https://rpc-atom-testnet.aura.network/' WHERE Name = 'Gaia Testnet';
            UPDATE Chain SET Websocket = 'wss://rpc-atom-testnet.aura.network/websocket' WHERE Name = 'Gaia Testnet';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
