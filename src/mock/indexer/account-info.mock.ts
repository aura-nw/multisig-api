export const accountInfoIndexerMock = {
  account_auth: {
    account: {
      '@type': '/cosmos.auth.v1beta1.BaseAccount',
      address: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
      pub_key: {
        '@type': '/cosmos.crypto.multisig.LegacyAminoPubKey',
        threshold: 1,
        public_keys: [
          {
            '@type': '/cosmos.crypto.secp256k1.PubKey',
            key: 'AnoOQm4UTbzswwES5Mo+/LHFbT9653fDecq4Rrc+2jnA',
          },
        ],
      },
      account_number: '41',
      sequence: '109',
    },
  },
  custom_info: {
    chain_id: 'aura-testnet-2',
    chain_name: 'Aura devnet',
  },
  _id: '6332c9ba3e870500148eecb5',
  address: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
  account_balances: [
    {
      _id: '63db738224f38a2b60923d81',
      denom: 'utaura',
      amount: '10517115',
    },
  ],
  account_delegations: [
    {
      delegation: {
        delegator_address: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
        validator_address: 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx',
        shares: '600000.000000000000000000',
      },
      balance: {
        denom: 'utaura',
        amount: '600000',
      },
      _id: '63db738224f38a05ee923d8b',
    },
    {
      delegation: {
        delegator_address: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
        validator_address: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
        shares: '1430000.000000000000000000',
      },
      balance: {
        denom: 'utaura',
        amount: '1430000',
      },
      _id: '63db738224f38a2dfe923d8c',
    },
  ],
  account_redelegations: [],
  account_spendable_balances: [
    {
      _id: '63db738224f38abf69923d86',
      denom: 'utaura',
      amount: '10517115',
    },
  ],
  account_unbonding: [],
  account_claimed_rewards: [
    {
      _id: '635a3b802f73b90012bdef59',
      validator_address: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
      denom: 'utaura',
      amount: '1464697',
    },
    {
      _id: '635a3be62f73b90012bdf422',
      validator_address: 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx',
      denom: 'utaura',
      amount: '0',
    },
  ],
  account_delegate_rewards: {
    rewards: [
      {
        validator_address: 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx',
        reward: [],
      },
      {
        validator_address: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
        reward: [
          {
            denom: 'utaura',
            amount: '8441800.547563334108300000',
          },
        ],
      },
    ],
    total: [
      {
        denom: 'utaura',
        amount: '8441800.547563334108300000',
      },
    ],
  },
};
