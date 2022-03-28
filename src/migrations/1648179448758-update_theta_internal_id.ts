import {MigrationInterface, QueryRunner} from "typeorm";

export class updateThetaInternalId1648179448758 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM Chain Where Name = 'Theta Testnet';
            INSERT INTO Chain (Name, Rest, Rpc, Websocket, Explorer, Symbol, Denom, Prefix, ChainId) VALUES ('Theta Testnet', 'https://rest.sentry-01.theta-testnet.polypore.xyz/', 'https://rpc.sentry-01.theta-testnet.polypore.xyz/', 'wss://rpc.sentry-01.theta-testnet.polypore.xyz/websocket', 'https://explorer.theta-testnet.polypore.xyz/', 'ATOM', 'uatom', 'cosmos', 'theta-testnet-001');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
