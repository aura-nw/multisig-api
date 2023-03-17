import { MigrationInterface, QueryRunner } from 'typeorm';

export class addMoreIndex1672218156413 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create index MultisigTransaction_TxHash_index
            on MultisigTransaction (TxHash);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
