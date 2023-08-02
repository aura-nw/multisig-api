import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterAuraTxAddDefaultToAddress1690961790488
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table AuraTx ALTER ToAddress SET DEFAULT "";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
