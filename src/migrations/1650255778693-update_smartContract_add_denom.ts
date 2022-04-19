import {MigrationInterface, QueryRunner} from "typeorm";

export class updateSmartContractAddDenom1650255778693 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE SmartContractTx ADD COLUMN Denom varchar(255) COLLATE utf8_unicode_ci NOT NULL AFTER InternalChainId;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
