import { MigrationInterface, QueryRunner } from "typeorm"

export class updateAuraTxAddRewardsAmount1669015368686 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE AuraTx ADD COLUMN RewardAmount FLOAT(12) NULL AFTER Amount;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
