import {MigrationInterface, QueryRunner} from "typeorm";

export class updateAuraExplorer1650424445087 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE Chain SET Explorer = 'https://explorer.test.aura.network/' WHERE Name = 'Aura Testnet';
            UPDATE Chain SET Explorer = 'https://explorer.dev.aura.network/' WHERE Name = 'Aura Devnet';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
