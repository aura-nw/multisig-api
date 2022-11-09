import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateMessageTblAddVoteType1667531227109
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE Message ADD COLUMN VoteOption int(11) NULL;
        ALTER TABLE Message ADD COLUMN ProposalId int(11) NULL;
        ALTER TABLE Message ADD COLUMN Voter varchar(50) NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
