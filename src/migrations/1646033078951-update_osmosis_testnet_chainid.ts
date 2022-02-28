import {MigrationInterface, QueryRunner} from "typeorm";

export class updateOsmosisTestnetChainid1646033078951 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE Chain SET ChainId = 'osmo-test-4' WHERE Name = 'Osmosis Testnet';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
