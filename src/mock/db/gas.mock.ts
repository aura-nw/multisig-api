export const gasMock = [
  {
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
    gasAmount: 90_000,
    multiplier: 0.13,
  },
  {
    typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
    gasAmount: 250_000,
    multiplier: 0.13,
  },
  {
    typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
    gasAmount: 250_000,
    multiplier: 0.13,
  },
  {
    typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
    gasAmount: 250_000,
    multiplier: 0.13,
  },
  {
    typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
    gasAmount: 150_000,
    multiplier: 0.13,
  },
];
