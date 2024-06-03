import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexerDbColum1717397610476 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE Chain ADD COLUMN IndexerDb VARCHAR(100) NULL AFTER IndexerV2`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
