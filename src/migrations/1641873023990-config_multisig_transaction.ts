import {MigrationInterface, QueryRunner} from "typeorm";

export class configMultisigTransaction1641873023990 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE MultisigTransaction CHANGE AuraTxId TxHash VARCHAR(255);
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
