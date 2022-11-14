import { MigrationInterface, QueryRunner } from "typeorm"

export class updateMessageTblAddDenom1668409703868 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE Message ADD COLUMN Denom varchar(45) NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
