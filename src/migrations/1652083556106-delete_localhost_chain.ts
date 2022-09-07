import {MigrationInterface, QueryRunner} from "typeorm";

export class deleteLocalhostChain1652083556106 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM Chain Where Name = 'Localhost';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
