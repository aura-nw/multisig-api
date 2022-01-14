import {MigrationInterface, QueryRunner} from "typeorm";

export class updateAuraTx1641975417823 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE AuraTx ADD COLUMN FromAddress VARCHAR(255) NOT NULL AFTER RawLogs;`);
        await queryRunner.query(`
        ALTER TABLE AuraTx ADD COLUMN ToAddress VARCHAR(255) NOT NULL AFTER FromAddress;`);
        await queryRunner.query(`
        ALTER TABLE AuraTx ADD COLUMN Amount FLOAT(12) NOT NULL AFTER ToAddress;`);
        await queryRunner.query(`
        ALTER TABLE AuraTx ADD COLUMN Denom VARCHAR(45) NOT NULL AFTER Amount;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
