import {MigrationInterface, QueryRunner} from "typeorm";

export class createProcedureAuraTx1645602015427 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELIMITER //

            CREATE TRIGGER update_multisig AFTER INSERT ON AuraTx
            FOR EACH ROW 
                BEGIN 
                IF NEW.Code = '0' THEN
                    UPDATE MultisigTransaction SET Status = 'SUCCESS' WHERE TxHash = NEW.TxHash;
                ELSE
                    UPDATE MultisigTransaction SET Status = 'FAILED' WHERE TxHash = NEW.TxHash;
                END IF;
            END;//
            
            DELIMITER ;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_multisig
        `)
    }

}
