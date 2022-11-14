import { MigrationInterface, QueryRunner } from "typeorm"

export class updateMessageTblAddInputOutput1668411806847 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE Message ADD COLUMN Inputs TEXT NULL;
        ALTER TABLE Message ADD COLUMN Outputs TEXT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
