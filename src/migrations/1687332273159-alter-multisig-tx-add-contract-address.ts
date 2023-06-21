import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterMultisigTxAddContractAddress1687332273159
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table MultisigTransaction add column ContractAddress varchar(100) null;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
