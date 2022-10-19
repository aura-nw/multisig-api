import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeOldChainAndAddTokenLogo1660114981357
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM Chain WHERE ChainId IN ('uni-2','osmo-test-4');

        ALTER TABLE Chain ADD COLUMN TokenImg varchar(255) AFTER Denom;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
