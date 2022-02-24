import {MigrationInterface, QueryRunner} from "typeorm";

export class createTriggerAuraTx1645613217194 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TRIGGER update_multisig AFTER INSERT ON AuraTx
            FOR EACH ROW 
                BEGIN 
                IF NEW.Code = '0' THEN
                    UPDATE MultisigTransaction SET Status = 'SUCCESS' WHERE TxHash = NEW.TxHash;
                ELSE
                    UPDATE MultisigTransaction SET Status = 'FAILED' WHERE TxHash = NEW.TxHash;
                END IF;
            END;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
