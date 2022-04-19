import {MigrationInterface, QueryRunner} from "typeorm";

export class updateTerraTestRpcRest1649387316357 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        UPDATE Chain SET Rest = 'https://bombay-lcd.terra.dev' WHERE Name = 'Terra Testnet';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
