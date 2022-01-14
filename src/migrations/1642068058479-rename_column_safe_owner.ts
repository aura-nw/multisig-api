import { MigrationInterface, QueryRunner } from "typeorm";

export class renameColumnSafeOwner1642068058479 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE SafeOwner CHANGE COLUMN Safe_Id SafeId varchar(255), CHANGE Owner_Address OwnerAddress varchar(255), CHANGE Owner_Pubkey OwnerPubkey varchar(255);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
