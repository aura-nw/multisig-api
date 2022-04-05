import {MigrationInterface, QueryRunner} from "typeorm";

export class renameColumnChainIdAuraTx1645517967087 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE AuraTx CHANGE COLUMN ChainId InternalChainId int(11);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
