export interface IAccountUnbonding {
  delegator_address: string;
  validator_address: string;
  entries: [
    {
      creation_height: string;
      completion_time: string;
      initial_balance: string;
      balance: string;
    },
  ];
}
export interface IAccountUnbound {
  address: string;
  account_unbonding: IAccountUnbonding[];
}
