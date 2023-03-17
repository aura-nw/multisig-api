import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGasXstaxy1679021044440 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', '150000', 'xstaxy-1');
        INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.bank.v1beta1.MsgSend', '90000', 'xstaxy-1');
        INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgDelegate', '250000', 'xstaxy-1');
        INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgBeginRedelegate', '250000', 'xstaxy-1');
        INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgUndelegate', '250000', 'xstaxy-1');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
