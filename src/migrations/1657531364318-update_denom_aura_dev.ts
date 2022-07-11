import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateDenomAuraDev1657531364318 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `update Chain set Denom = "utaura" where Name = "Aura Devnet";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
