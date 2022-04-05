import { MigrationInterface, QueryRunner } from "typeorm";

export class addColumnSafeAddressHash1643082409829 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE Safe ADD COLUMN AddressHash varchar(44) NOT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
