import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateChainTbUpdateGasLimit1658911995652
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          UPDATE Gas SET GasAmount = 90000 WHERE ChainId = 'serenity-testnet-001' AND TypeUrl = '/cosmos.bank.v1beta1.MsgSend';
          UPDATE Gas SET GasAmount = 150000 WHERE ChainId = 'evmos_9000-4' AND TypeUrl = '/cosmos.bank.v1beta1.MsgSend';
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
