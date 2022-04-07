import {MigrationInterface, QueryRunner} from "typeorm";

export class updateGaiaTestnet1649316001942 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE Chain SET Rest = 'https://rest-atom-testnet.aura.network/' WHERE Name = 'Theta Testnet';
            UPDATE Chain SET Rpc = 'https://rpc-atom-testnet.aura.network/' WHERE Name = 'Theta Testnet';
            UPDATE Chain SET Websocket = 'wss://rpc-atom-testnet.aura.network/websocket' WHERE Name = 'Theta Testnet';
            UPDATE Chain SET Name = 'Gaia Testnet' WHERE Name = 'Theta Testnet';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
