import { MigrationInterface, QueryRunner } from "typeorm"

export class createMessageTable1665115117236 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE Message (
            CreatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            UpdatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            Id int(11) NOT NULL AUTO_INCREMENT,
            TxId int(11) COLLATE utf8_unicode_ci NOT NULL,
            TypeUrl varchar(100) COLLATE utf8_unicode_ci NOT NULL,
            FromAddress varchar(100) COLLATE utf8_unicode_ci NULL,
            ToAddress varchar(100) COLLATE utf8_unicode_ci NULL,
            Amount varchar(25) COLLATE utf8_unicode_ci NULL,
            DelegatorAddress varchar(100) COLLATE utf8_unicode_ci NULL,
            ValidatorAddress varchar(100) COLLATE utf8_unicode_ci NULL,
            ValidatorSrcAddress varchar(100) COLLATE utf8_unicode_ci NULL,
            ValidatorDstAddress varchar(100) COLLATE utf8_unicode_ci NULL,
            PRIMARY KEY (Id),
            INDEX (TxId)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
          `);   
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
