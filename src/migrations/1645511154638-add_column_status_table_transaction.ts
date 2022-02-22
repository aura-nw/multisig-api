import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnStatusTableTransaction1645511154638 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE MultisigConfirm ADD COLUMN Status varchar(44) NOT NULL AFTER InternalChainId;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
