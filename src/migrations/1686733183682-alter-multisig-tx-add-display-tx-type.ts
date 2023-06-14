import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterMultisigTxAddDisplayTxType1686733183682
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table MultisigTransaction add column DisplayType varchar(100) null;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
