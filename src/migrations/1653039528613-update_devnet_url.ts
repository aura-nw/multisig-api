import {MigrationInterface, QueryRunner} from "typeorm";

export class updateDevnetUrl1653039528613 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE Chain SET Rest = 'https://lcd.dev.aura.network/' WHERE Name = 'Aura Devnet';
            UPDATE Chain SET Rpc = 'https://rpc.dev.aura.network/' WHERE Name = 'Aura Devnet';
            UPDATE Chain SET Websocket = 'wss://rpc.dev.aura.network/websocket' WHERE Name = 'Aura Devnet';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
