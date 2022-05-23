import {MigrationInterface, QueryRunner} from "typeorm";

export class updateAtomEndpoint1653278204183 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE Chain SET Rest = 'https://rest.sentry-01.theta-testnet.polypore.xyz/' WHERE Name = 'Gaia Testnet';
            UPDATE Chain SET Rpc = 'https://rpc.sentry-01.theta-testnet.polypore.xyz/' WHERE Name = 'Gaia Testnet';
            UPDATE Chain SET Websocket = 'wss://rpc.sentry-01.theta-testnet.polypore.xyz/websocket' WHERE Name = 'Gaia Testnet';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
