import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateChainTbAddDecimalColumn1656659769824
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table Chain add column CoinDecimals int default 6;
      update Chain set CoinDecimals = 18 where Name = "Evmos Testnet";
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
