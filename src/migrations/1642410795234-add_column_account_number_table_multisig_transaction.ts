import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnAccountNumberTableMultisigTransaction1642410795234 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE MultisigTransaction ADD COLUMN AccountNumber VARCHAR(255);`);

        await queryRunner.query(`
        ALTER TABLE MultisigTransaction CHANGE COLUMN GasAmount Fee float;`);

        await queryRunner.query(`
        ALTER TABLE MultisigTransaction DROP COLUMN Memo;`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
