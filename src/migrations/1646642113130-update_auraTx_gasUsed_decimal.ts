import {MigrationInterface, QueryRunner} from "typeorm";

export class updateAuraTxGasUsedDecimal1646642113130 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE AuraTx CHANGE COLUMN GasUsed GasUsed decimal NOT NULL;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
