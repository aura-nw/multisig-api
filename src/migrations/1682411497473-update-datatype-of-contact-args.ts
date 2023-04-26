import { MigrationInterface, QueryRunner } from "typeorm"

export class updateDatatypeOfContactArgs1682411497473 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table Message modify ContractArgs LONGTEXT null;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
