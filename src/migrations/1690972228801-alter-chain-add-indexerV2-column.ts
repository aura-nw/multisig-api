import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterChainAddIndexerV2Column1690972228801
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE Chain ADD COLUMN IndexerV2 VARCHAR(100) NULL AFTER Explorer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
