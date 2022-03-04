import {MigrationInterface, QueryRunner} from "typeorm";

export class updateChainDeleteTerra1646377546968 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM Chain Where Name = 'Terra Testnet';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
