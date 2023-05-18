import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateDatatypeOfBodyBytes1684395463543
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table MultisigConfirm modify bodyBytes LONGTEXT null;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
