export class DelegationDetailDto {
  // name: string;
  operatorAddress: string;

  balance: {
    denom: string;
    amount: number;
  };

  reward: [
    {
      denom: string;
      amount: string;
    },
  ];
}
