import { MigrationInterface, QueryRunner } from "typeorm"

export class createTxMessageTable1666232327903 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE TxMessage (
            CreatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            UpdatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            Id int(11) NOT NULL AUTO_INCREMENT,
            TxId int(11) COLLATE utf8_unicode_ci NOT NULL,
            FromAddress varchar(100) COLLATE utf8_unicode_ci NULL,
            ToAddress varchar(100) COLLATE utf8_unicode_ci NULL,
            Amount float(12) COLLATE utf8_unicode_ci NULL,
            Denom varchar(45) COLLATE utf8_unicode_ci NULL,
            PRIMARY KEY (Id),
            INDEX (TxId)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE TxMessage`);
    }

}
