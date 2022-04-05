import {MigrationInterface, QueryRunner} from "typeorm";

export class updateMultisigTxDeleteRedundant1649124940422 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE MultisigTransaction DROP COLUMN Signature;
            ALTER TABLE MultisigTransaction DROP COLUMN MultisigPubkey;
            ALTER TABLE MultisigTransaction DROP COLUMN Map;
            ALTER TABLE MultisigTransaction DROP COLUMN Msg;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
