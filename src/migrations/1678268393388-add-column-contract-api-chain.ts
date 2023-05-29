import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnContractApiChain1678268393388
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE Chain ADD COLUMN ContractAPI VARCHAR(255) NULL AFTER Explorer;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
