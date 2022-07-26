import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableGas1658548184267 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS Gas (
            CreatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            UpdatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            Id int(11) NOT NULL AUTO_INCREMENT,
            TypeUrl varchar(255) COLLATE utf8_unicode_ci,
            GasAmount float,
            ChainId varchar(255),
            PRIMARY KEY (Id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
          INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.bank.v1beta1.MsgSend', '80000', 'aura-testnet');
          INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgDelegate', '250000', 'aura-testnet');
          INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgBeginRedelegate', '250000', 'aura-testnet');
          INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgUndelegate', '250000', 'aura-testnet');
          INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.bank.v1beta1.MsgSend', '80000', 'serenity-testnet-001');
          INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgDelegate', '250000', 'serenity-testnet-001');
          INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgBeginRedelegate', '250000', 'serenity-testnet-001');
          INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgUndelegate', '250000', 'serenity-testnet-001');
          INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.bank.v1beta1.MsgSend', '140000', 'evmos_9000-4');
          INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgDelegate', '500000', 'evmos_9000-4');
          INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgBeginRedelegate', '500000', 'evmos_9000-4');
          INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgUndelegate', '500000', 'evmos_9000-4');
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
