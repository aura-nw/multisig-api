import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnStatusTableMultisigTransaction1641886365755 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE MultisigTransaction ADD COLUMN Status VARCHAR(45) NOT NULL AFTER Denom`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
