export const delegationsResponseMock = {
  availableBalance: {
    _id: '63db738224f38a2b60923d81',
    denom: 'utaura',
    amount: '10517115',
  },
  delegations: [
    {
      operatorAddress: 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx',
      balance: {
        denom: 'utaura',
        amount: '600000',
      },
      reward: [],
    },
    {
      operatorAddress: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
      balance: {
        denom: 'utaura',
        amount: '1430000',
      },
      reward: [
        {
          denom: 'utaura',
          amount: '8441800.547563334108300000',
        },
      ],
    },
  ],
  total: {
    staked: {
      amount: '2030000',
      denom: 'utaura',
    },
    reward: [
      {
        denom: 'utaura',
        amount: '8441800.547563334108300000',
      },
    ],
  },
};
