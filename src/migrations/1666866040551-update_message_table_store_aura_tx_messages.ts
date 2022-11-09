import { MigrationInterface, QueryRunner } from "typeorm"

export class updateMessageTableStoreAuraTxMessages1666866040551 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE Message ADD COLUMN AuraTxId int(11) COLLATE utf8_unicode_ci NULL AFTER TxId;
        ALTER TABLE Message MODIFY COLUMN TxId int(11) COLLATE utf8_unicode_ci NULL;
        CREATE INDEX AuraTxID ON Message(AuraTxId);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
