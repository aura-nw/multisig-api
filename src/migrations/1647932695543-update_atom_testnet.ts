import {MigrationInterface, QueryRunner} from "typeorm";

export class updateAtomTestnet1647932695543 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE Chain SET Rest = 'https://rest.sentry-01.theta-testnet.polypore.xyz/' WHERE Name = 'Vega Testnet';
            UPDATE Chain SET Rpc = 'https://rpc.sentry-01.theta-testnet.polypore.xyz/' WHERE Name = 'Vega Testnet';
            UPDATE Chain SET Websocket = 'wss://rpc.sentry-01.theta-testnet.polypore.xyz/websocket' WHERE Name = 'Vega Testnet';
            UPDATE Chain SET Explorer = 'https://explorer.theta-testnet.polypore.xyz/' WHERE Name = 'Vega Testnet';
            UPDATE Chain SET ChainId = 'theta-testnet-001' WHERE Name = 'Vega Testnet';
            UPDATE Chain SET Name = 'Theta Testnet' WHERE Name = 'Vega Testnet';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
