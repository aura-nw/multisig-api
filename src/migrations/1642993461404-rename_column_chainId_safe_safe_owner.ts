import { MigrationInterface, QueryRunner } from "typeorm";

export class renameColumnChainIdSafeSafeOwner1642993461404 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE Safe CHANGE COLUMN ChainId InternalChainId int(11);`);
        await queryRunner.query(`
        ALTER TABLE SafeOwner CHANGE COLUMN ChainId InternalChainId int(11);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
