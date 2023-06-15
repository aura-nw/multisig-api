export class AccountInfo {
  accountNumber: number;

  sequence: number;

  balances: [
    {
      denom: string;
      amount: string;
      minimal_denom?: string;
    },
  ];
}
