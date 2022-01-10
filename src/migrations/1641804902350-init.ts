import {MigrationInterface, QueryRunner} from "typeorm";

export class init1641804902350 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
