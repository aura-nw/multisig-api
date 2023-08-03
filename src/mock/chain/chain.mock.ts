import { plainToInstance } from 'class-transformer';
import { Chain } from '../../modules/chain/entities/chain.entity';
import { ChainInfo, TokenInfo } from '../../utils/validations';

export const tokens = plainToInstance(TokenInfo, [
  {
    name: 'EZPZ Token',
    cw20Address:
      'aura10sxfmtls2x2sq0xz64cfw485tflzjmp9ts3hcvycvm7u073levpqk22wrc',
  },
  {
    name: 'Aura Hub',
    ibcDenom:
      'ibc/40CA5EF447F368B7F2276A689383BE3C427B15395D4BF6639B605D36C0846A20',
  },
]);

export const chains: ChainInfo[] = plainToInstance(ChainInfo, [
  {
    id: 22,
    name: 'Aura Devnet',
    rest: 'https://lcd.dev.aura.network/',
    rpc: 'https://rpc.dev.aura.network/',
    explorer: 'https://explorer.dev.aura.network',
    chainId: 'aura-testnet-2',
    symbol: 'TAURA',
    denom: 'utaura',
    prefix: 'aura',
    coinDecimals: 6,
    gasPrice: 0.0002,
    tokenImg:
      'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/aura.png',
    tokens: [
      {
        name: 'EZPZ Token',
        cw20Address:
          'aura10sxfmtls2x2sq0xz64cfw485tflzjmp9ts3hcvycvm7u073levpqk22wrc',
      },
      {
        name: 'Aura Hub',
        ibcDenom:
          'ibc/40CA5EF447F368B7F2276A689383BE3C427B15395D4BF6639B605D36C0846A20',
      },
    ],
  },
]);

export const chainList: Chain[] = [
  {
    createdAt: new Date('2022-05-20T09:46:05.214Z'),
    updatedAt: new Date('2022-11-23T04:01:34.077Z'),
    id: 22,
    name: 'Aura Devnet',
    rest: 'https://lcd.dev.aura.network/',
    rpc: 'https://rpc.dev.aura.network/',
    webSocket: 'wss://rpc.dev.aura.network/websocket',
    explorer: 'https://explorer.dev.aura.network',
    indexerV2: '',
    contractAPI:
      'https://explorer-api.dev.aura.network/api/v1/contracts/$contract_address',
    symbol: 'TAURA',
    denom: 'utaura',
    tokenImg:
      'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/aura.png',
    chainId: 'aura-testnet-2',
    prefix: 'aura',
    coinDecimals: 6,
    gasPrice: 0.0002,
  },
];
