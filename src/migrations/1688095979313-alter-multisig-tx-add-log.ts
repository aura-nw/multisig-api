import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterMultisigTxAddLog1688095979313 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table MultisigTransaction add Logs longtext null;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
