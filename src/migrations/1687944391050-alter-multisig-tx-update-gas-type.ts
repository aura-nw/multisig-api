import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterMultisigTxUpdateGasType1687944391050
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table MultisigTransaction modify Gas bigint not null;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
