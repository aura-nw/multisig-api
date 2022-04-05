import {MigrationInterface, QueryRunner} from "typeorm";

export class renameColumnChainIdTableTransaction1643009580873 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE MultisigTransaction CHANGE COLUMN ChainId InternalChainId int(11);`);
        await queryRunner.query(`
        ALTER TABLE MultisigConfirm CHANGE COLUMN ChainId InternalChainId int(11);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
