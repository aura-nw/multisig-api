import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUserTable1663753461548 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE User (
            CreatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            UpdatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            Id int(11) NOT NULL AUTO_INCREMENT,
            Address varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            Pubkey varchar(800) COLLATE utf8_unicode_ci NOT NULL,
            PRIMARY KEY (Id),
            UNIQUE INDEX (Address ASC)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
