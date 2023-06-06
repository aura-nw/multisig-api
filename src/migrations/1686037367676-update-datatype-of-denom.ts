import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateDatatypeOfDenom1686037367676 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table Message modify Denom varchar(255) null;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
