import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateChainSplitEnv1646044859482 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM Chain;`);
    await queryRunner.query(`
                INSERT INTO Chain (Name, Rest, Rpc, Websocket, Denom, Prefix, ChainId) VALUES ('Aura Testnet', 'https://rpc-testnet.aura.network', 'https://tendermint-testnet.aura.network', 'wss://tendermint-testnet.aura.network/websocket', 'uaura', 'aura', 'aura-testnet');
                INSERT INTO Chain (Name, Rest, Rpc, Websocket, Denom, Prefix, ChainId) VALUES ('Vega Testnet', 'http://198.50.215.1:4317', 'http://198.50.215.1:46657', 'ws://198.50.215.1:46657/websocket', 'uatom', 'cosmos', 'vega-testnet');
                INSERT INTO Chain (Name, Rest, Rpc, Websocket, Denom, Prefix, ChainId) VALUES ('Terra Testnet', 'https://bombay.stakesystems.io', 'https://bombay.stakesystems.io:2053', 'wss://bombay.stakesystems.io:2053/websocket', 'uluna', 'terra', 'bombay-12');
                INSERT INTO Chain (Name, Rest, Rpc, Websocket, Denom, Prefix, ChainId) VALUES ('Juno Testnet', 'https://lcd.uni.juno.deuslabs.fi', 'https://rpc.uni.juno.deuslabs.fi', 'wss://rpc.uni.juno.deuslabs.fi/websocket', 'ujunox', 'juno', 'uni-2');
                INSERT INTO Chain (Name, Rest, Rpc, Websocket, Denom, Prefix, ChainId) VALUES ('Osmosis Testnet', 'https://osmosistest-lcd.quickapi.com/swagger/', 'https://testnet-rpc.osmosis.zone/', 'wss://testnet-rpc.osmosis.zone/websocket', 'uosmo', 'osmo', 'osmo-test-4');        
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
