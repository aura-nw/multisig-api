import {MigrationInterface, QueryRunner} from "typeorm";

export class updateMultisigConfirmBodybytes1649215966167 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE MultisigConfirm MODIFY BodyBytes varchar(255) COLLATE utf8_unicode_ci;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
