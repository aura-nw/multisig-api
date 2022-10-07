import { MigrationInterface, QueryRunner } from "typeorm"

export class addGasReward1665132696476 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', '150000', 'aura-testnet');
            INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', '150000', 'serenity-testnet-001');
            INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', '150000', 'theta-testnet-001');
            INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', '150000', 'euphoria-1');
            INSERT INTO Gas (TypeUrl, GasAmount, ChainId) VALUES ('/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', '300000', 'evmos_9000-4');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
