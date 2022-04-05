import {MigrationInterface, QueryRunner} from "typeorm";

export class retypeChainidTableMultisigConfirm1642488325023 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE MultisigConfirm CHANGE COLUMN ChainId ChainId int(11) NOT NULL;`);

        await queryRunner.query(`
        DROP TABLE IF EXISTS Owner;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
