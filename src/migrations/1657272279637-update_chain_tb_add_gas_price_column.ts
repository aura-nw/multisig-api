import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateChainTbAddGasPriceColumn1657272279637
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table Chain add column GasPrice double default 0.0025;
            update Chain set GasPrice = 25000000000 where Name = "Evmos Testnet";
            update Chain set GasPrice = 0.0002 where Name = "Aura Devnet";
            update Chain set GasPrice = 0.0025 where Name = "Serenity Testnet";
            update Chain set GasPrice = 0.0025 where Name = "Juno Testnet";
            update Chain set GasPrice = 0.025 where Name = "Osmosis Testnet";
            `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
