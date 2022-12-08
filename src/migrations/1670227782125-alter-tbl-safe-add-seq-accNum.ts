import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterTblSafeAddSeqAccNum1670227782125
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE Safe ADD COLUMN AccountNumber VARCHAR(255) NULL AFTER SafeAddress;
        ALTER TABLE Safe ADD COLUMN Sequence varchar(255) NULL AFTER Status;
        ALTER TABLE Safe ADD COLUMN NextQueueSeq varchar(255) NULL AFTER Status;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
