import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterMultisigtxAddMemoColumn1700533398605
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE MultisigTransaction ADD COLUMN Memo VARCHAR(256) NULL AFTER Denom`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
