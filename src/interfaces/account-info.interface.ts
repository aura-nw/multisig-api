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

export interface IAccountBalance {
  amount: number;
  denom: string;
  base_denom: string;
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
  account_number: number;
  address: string;
  balances: IAccountBalance[];
  pubkey: IPubkey;
  sequence: number;
  spemdable_balances: IAccountBalance[];
  type: string;
  updated_at: string;
}

export interface IAccounts {
  account: IAccountInfo[];
}
