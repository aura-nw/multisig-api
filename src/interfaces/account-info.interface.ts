export interface IPubkey {
  '@type': string;
  key?: string;
  threshold?: number;
  public_keys?: [
    {
      '@type': string;
      key: string;
    },
  ];
}

export interface IAccountDelegation {
  delegation: {
    delegator_address: string;
    validator_address: string;
    shares: string;
  };
  balance: {
    amount: number;
    denom: string;
  };
}

export interface IAccountInfo {
  account_auth: {
    account: {
      '@type': string;
      address: string;
      pub_key: IPubkey;
      account_number: string;
      sequence: string;
      base_vesting_account?: {
        base_account: {
          account_number: string;
          sequence: string;
        };
      };
    };
  };
  address: string;
  account_balances: [
    {
      denom: string;
      amount: string;
    },
  ];
  account_delegations: IAccountDelegation[];
  account_delegate_rewards: {
    rewards: [
      {
        validator_address: string;
        reward: [
          {
            denom: string;
            amount: string;
          },
        ];
      },
    ];
    total: [
      {
        denom: string;
        amount: string;
      },
    ];
  };
  account_redelegations: [];
  account_spendable_balances: [
    {
      denom: string;
      amount: string;
    },
  ];
  account_unbonding: [];
  account_claimed_rewards: [
    {
      validator_address: string;
      denom: string;
      amount: string;
    },
  ];
}
