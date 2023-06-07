import { MigrationInterface, QueryRunner } from 'typeorm';

export class dropGasTable1686126313188 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table IF EXISTS Gas;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
