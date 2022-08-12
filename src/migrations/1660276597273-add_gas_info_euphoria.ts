import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGasInfoEuphoria1660276597273 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.bank.v1beta1.MsgSend', '90000', 'euphoria-1');
            INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgDelegate', '250000', 'euphoria-1');
            INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgBeginRedelegate', '250000', 'euphoria-1');
            INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.staking.v1beta1.MsgUndelegate', '250000', 'euphoria-1');
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
