import { MigrationInterface, QueryRunner } from 'typeorm';

export class addJSONMessageToMultisigTx1681444035553
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE MultisigTransaction ADD COLUMN RawMessages JSON NULL AFTER ToAddress;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
