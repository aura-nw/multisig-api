import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterAuraTxAddContractAddress1687333191114
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table AuraTx add column ContractAddress varchar(100) null;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
