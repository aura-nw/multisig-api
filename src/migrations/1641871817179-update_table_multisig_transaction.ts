import {MigrationInterface, QueryRunner} from "typeorm";

export class updateTableMultisigTransaction1641871817179 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE MultisigTransaction ADD COLUMN Denom VARCHAR(45) NOT NULL AFTER Amount`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
