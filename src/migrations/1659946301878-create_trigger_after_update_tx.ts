import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTriggerAfterUpdateTx1659946301878
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TRIGGER updateHistoryTag AFTER UPDATE ON MultisigTransaction
            FOR EACH ROW 
                BEGIN 
                IF (NEW.Status IN ('SUCCESS', 'FAILED', 'CANCELLED')) THEN
                    UPDATE Safe SET TxHistoryTag = UNIX_TIMESTAMP() WHERE Id = NEW.SafeId;
                END IF;
            END;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
