import {MigrationInterface, QueryRunner} from "typeorm";

export class updateChainAddPrefix1644811324071 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE Chain ADD COLUMN Prefix varchar(45) NOT NULL AFTER Denom;
            UPDATE Chain SET Prefix = 'aura' WHERE Name = 'Localhost' OR Name = 'Aura Testnet';
            UPDATE Chain SET Prefix = 'cosmos' WHERE Name = 'Vega Testnet';
            UPDATE Chain SET Prefix = 'terra' WHERE Name = 'Terra Testnet';
            UPDATE Chain SET Prefix = 'juno' WHERE Name = 'Juno Testnet (UNI)';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
