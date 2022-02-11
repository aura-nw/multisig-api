import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnDenomTableChain1644563390556 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE Chain ADD COLUMN Denom varchar(45) NOT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
