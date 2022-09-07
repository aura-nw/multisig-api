import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateAmountFeeDatatype1659694772281
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE MultisigTransaction MODIFY Amount double;
    ALTER TABLE AuraTx MODIFY Amount double;
    ALTER TABLE AuraTx MODIFY Fee double;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
