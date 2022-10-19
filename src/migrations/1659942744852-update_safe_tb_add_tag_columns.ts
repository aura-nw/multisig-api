import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateSafeTbAddTagColumns1659942744852
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    alter table Safe add column TxHistoryTag varchar(20);
    alter table Safe add column TxQueuedTag varchar(20);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
