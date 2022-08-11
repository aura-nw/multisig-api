import { MigrationInterface, QueryRunner } from 'typeorm';

export class addMultiplierColumnUpdateGasData1660202551696
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            alter table Gas add column Multiplier float default 0.13;

            update Gas set Multiplier = 0.17 where ChainId = "evmos_9000-4";


            UPDATE Gas SET GasAmount = 90000 WHERE ChainId IN ('serenity-testnet-001', 'aura-testnet') AND TypeUrl = '/cosmos.bank.v1beta1.MsgSend';
            UPDATE Gas SET GasAmount = 150000 WHERE ChainId = 'evmos_9000-4' AND TypeUrl = '/cosmos.bank.v1beta1.MsgSend';

            INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.bank.v1beta1.MsgSend', '90000', 'theta-testnet-001');
            INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgDelegate', '250000', 'theta-testnet-001');
            INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgBeginRedelegate', '250000', 'theta-testnet-001');
            INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgUndelegate', '250000', 'theta-testnet-001');
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
