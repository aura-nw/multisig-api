import {MigrationInterface, QueryRunner} from "typeorm";

export class updateAuraTxHeight1642581363909 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE AuraTx CHANGE COLUMN Height Height int(11) NOT NULL;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
