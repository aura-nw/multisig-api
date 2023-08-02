import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterMultisigTxAddDefaultToAddress1690961574604
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table MultisigTransaction ALTER ToAddress SET DEFAULT "";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
