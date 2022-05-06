import {MigrationInterface, QueryRunner} from "typeorm";

export class deleteOldChain1651826009100 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM Chain Where Name = 'Aura Testnet';
            DELETE FROM Chain Where Name = 'Aura Devnet';
            DELETE FROM Chain Where Name = 'Aura Localhost';
            DELETE FROM Chain Where Name = 'Terra Testnet';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
