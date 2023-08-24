import { MigrationInterface, QueryRunner } from 'typeorm';

export class allowNullToaddressAuratx1692841309003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE AuraTx MODIFY ToAddress varchar(255) null;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
