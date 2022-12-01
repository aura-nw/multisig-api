import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateDefaultGasAuraTestnet21669860415608
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          UPDATE Gas SET ChainId = 'aura-testnet-2' WHERE ChainId = 'aura-testnet';
          UPDATE Gas SET ChainId = 'euphoria-2' WHERE ChainId = 'euphoria-1';
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
