import { NetworkListResponseDto } from '../modules/chain/dto';

export const mockChain: NetworkListResponseDto[] = [
  {
    id: 19,
    name: 'Theta Testnet',
    rest: 'https://atom-test-lcd.dcpinfra.com/',
    rpc: 'https://atom-test-rpc.dcpinfra.com/',
    explorer: 'https://explorer.theta-testnet.polypore.xyz/',
    chainId: 'theta-testnet-001',
    symbol: 'ATOM',
    denom: 'uatom',
    prefix: 'cosmos',
    coinDecimals: 6,
    gasPrice: 0.0025,
    tokenImg:
      'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/atom.png',
    defaultGas: [
      {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        gasAmount: 90000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        gasAmount: 250000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
        gasAmount: 250000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
        gasAmount: 250000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
        gasAmount: 150000,
        multiplier: 0.13,
      },
    ],
  },
  {
    id: 21,
    name: 'Serenity Testnet',
    rest: 'https://lcd.serenity.aura.network',
    rpc: 'https://rpc.serenity.aura.network',
    explorer: 'https://serenity.aurascan.io',
    chainId: 'serenity-testnet-001',
    symbol: 'AURA',
    denom: 'uaura',
    prefix: 'aura',
    coinDecimals: 6,
    gasPrice: 0.0025,
    tokenImg:
      'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/aura.png',
    defaultGas: [
      {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        gasAmount: 90000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        gasAmount: 250000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
        gasAmount: 250000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
        gasAmount: 250000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
        gasAmount: 150000,
        multiplier: 0.13,
      },
    ],
  },
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
    defaultGas: [
      {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        gasAmount: 90000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        gasAmount: 250000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
        gasAmount: 250000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
        gasAmount: 250000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
        gasAmount: 150000,
        multiplier: 0.13,
      },
    ],
  },
  {
    id: 23,
    name: 'Evmos Testnet',
    rest: 'https://evmo-test-lcd.dcpinfra.com/',
    rpc: 'https://evmo-test-rpc.dcpinfra.com/',
    explorer: 'https://testnet.mintscan.io/evmos-testnet',
    chainId: 'evmos_9000-4',
    symbol: 'TEVMOS',
    denom: 'atevmos',
    prefix: 'evmos',
    coinDecimals: 18,
    gasPrice: 25000000000,
    tokenImg:
      'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/evmos.png',
    defaultGas: [
      {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        gasAmount: 150000,
        multiplier: 0.17,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        gasAmount: 500000,
        multiplier: 0.17,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
        gasAmount: 500000,
        multiplier: 0.17,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
        gasAmount: 500000,
        multiplier: 0.17,
      },
      {
        typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
        gasAmount: 300000,
        multiplier: 0.13,
      },
    ],
  },
  {
    id: 36,
    name: 'Euphoria Testnet',
    rest: 'https://lcd.euphoria.aura.network',
    rpc: 'https://rpc.euphoria.aura.network',
    explorer: 'https://euphoria.aurascan.io',
    chainId: 'euphoria-2',
    symbol: 'EAURA',
    denom: 'ueaura',
    prefix: 'aura',
    coinDecimals: 6,
    gasPrice: 0.0025,
    tokenImg:
      'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/aura.png',
    defaultGas: [
      {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        gasAmount: 90000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        gasAmount: 250000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
        gasAmount: 250000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
        gasAmount: 250000,
        multiplier: 0.13,
      },
      {
        typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
        gasAmount: 150000,
        multiplier: 0.13,
      },
    ],
  },
  {
    id: 37,
    name: 'Canto Mainnet',
    rest: 'http://chainripper-2.althea.net:1317',
    rpc: 'http://chainripper-2.althea.net:20878',
    explorer: 'https://atomscan.com/canto',
    chainId: 'canto_7700-1',
    symbol: 'CANTO',
    denom: 'acanto',
    prefix: 'canto',
    coinDecimals: 18,
    gasPrice: 20000000000,
    tokenImg:
      'https://assets.coingecko.com/coins/images/26959/large/canto-network.png?1661215219',
    defaultGas: [],
  },
];
