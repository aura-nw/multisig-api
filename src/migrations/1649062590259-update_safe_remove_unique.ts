import {MigrationInterface, QueryRunner} from "typeorm";

export class updateSafeRemoveUnique1649062590259 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE Safe DROP INDEX IDX_e9a9197d6fe789246111d3ad47;
            CREATE INDEX IDX_SafeAddress ON Safe (SafeAddress);
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
