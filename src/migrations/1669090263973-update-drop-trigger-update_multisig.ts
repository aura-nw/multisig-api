import { MigrationInterface, QueryRunner } from "typeorm"

export class updateDropTriggerUpdateMultisig1669090263973 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('drop trigger update_multisig;');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
