import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateChainAddSymbol1646123786581 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE Chain ADD COLUMN Symbol varchar(45) NOT NULL AFTER Websocket;
            UPDATE Chain SET Symbol = 'AURA' WHERE Name = 'Aura Testnet';
            UPDATE Chain SET Symbol = 'ATOM' WHERE Name = 'Vega Testnet';
            UPDATE Chain SET Symbol = 'LUNA' WHERE Name = 'Terra Testnet';
            UPDATE Chain SET Symbol = 'JUNO' WHERE Name = 'Juno Testnet';
            UPDATE Chain SET Symbol = 'OSMO' WHERE Name = 'Osmosis Testnet';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
