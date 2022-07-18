import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateFeeDatatype1655871008666 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE MultisigTransaction MODIFY Fee double;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
