import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateDenomAuraDev1657513261598 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `update Chain set Symbol = "TAURA", Denom = "taura" where ChainId = "aura-devnet";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
