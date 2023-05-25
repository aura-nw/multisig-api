import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateDatatypeOfDenom1684998484644 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table MultisigTransaction modify Denom varchar(255) null;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
