import {MigrationInterface, QueryRunner} from "typeorm";

export class updateAuraTxAddFeeColumn1646300701376 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE AuraTx ADD COLUMN Fee float AFTER GasWanted;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
