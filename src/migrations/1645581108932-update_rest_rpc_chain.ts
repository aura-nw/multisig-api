import {MigrationInterface, QueryRunner} from "typeorm";

export class updateRestRpcChain1645581108932 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE Chain SET Rest = 'https://rpc-testnet.aura.network' WHERE Name = 'Aura Testnet';
            UPDATE Chain SET Rpc = 'https://tendermint-testnet.aura.network' WHERE Name = 'Aura Testnet';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
