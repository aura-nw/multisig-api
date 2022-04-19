import {MigrationInterface, QueryRunner} from "typeorm";

export class updateBodybytesMultisigConfirm1650270292630 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE MultisigConfirm MODIFY BodyBytes text COLLATE utf8_unicode_ci;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
