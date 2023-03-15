import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateMessageAddColumnContract1678864568933
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE Message ADD COLUMN ContractSender VARCHAR(255) NULL AFTER Voter;
        ALTER TABLE Message ADD COLUMN ContractAddress varchar(255) NULL AFTER Voter;
        ALTER TABLE Message ADD COLUMN ContractFunction varchar(255) NULL AFTER Voter;
        ALTER TABLE Message ADD COLUMN ContractArgs varchar(255) NULL AFTER Voter;
        ALTER TABLE Message ADD COLUMN ContractFunds varchar(255) NULL AFTER Voter;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
