import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTxHistoryTbl1672217939646 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table TransactionHistory
        (
            SafeAddress     varchar(100) not null,
            TxHash          varchar(255) not null,
            CreatedAt       timestamp(6) null,
            InternalChainId int          not null,
            primary key (InternalChainId, SafeAddress, TxHash)
        );

        create index TransactionHistory_SafeAddress_index
            on TransactionHistory (SafeAddress);

        create index TransactionHistory_TxHash_index
            on TransactionHistory (TxHash);
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
