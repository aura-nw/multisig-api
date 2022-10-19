import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateExplorerEndpoint1654588018406 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE Chain SET Explorer = 'https://explorer.dev.aura.network' WHERE Name = 'Aura Devnet';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
