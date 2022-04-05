import {MigrationInterface, QueryRunner} from "typeorm";

export class updateChainDenom1644894366434 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE Chain SET Denom = 'ujunox' WHERE Name = 'Juno Testnet (UNI)';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
