import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTableNotification1671068424972 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE Notification (
            CreatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            UpdatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            Id int(11) NOT NULL AUTO_INCREMENT,
            UserId int(11) NOT NULL,
            EventType varchar(100) COLLATE utf8_unicode_ci NOT NULL,
            SafeId int(11) NULL,
            SafeCreatorAddress varchar(100) COLLATE utf8_unicode_ci NULL,
            SafeAddress varchar(100) COLLATE utf8_unicode_ci NULL,
            TotalOwner int(11) NULL,
            TxId int(11) NULL,
            TxCreatorAddress varchar(100) COLLATE utf8_unicode_ci NULL,
            TxSequence int(11) NULL,
            ProposalNumber int(11) NULL,
            ProposalName varchar(100) COLLATE utf8_unicode_ci NULL,
            ProposalEndDate timestamp,
            Status varchar(100) COLLATE utf8_unicode_ci NULL,
            InternalChainId int not null,
            PRIMARY KEY (Id),
            INDEX (UserId ASC)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
