import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateChainidAuraDev1657526650643 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `update Chain set ChainId = "aura-testnet", Denom = "taura" where Name = "Aura Devnet";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
