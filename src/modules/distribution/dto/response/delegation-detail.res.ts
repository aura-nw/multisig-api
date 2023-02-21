export class DelegationDetailDto {
  // name: string;
  operatorAddress: string;

  balance: {
    denom: string;
    amount: string;
  };

  reward: {
    denom: string;
    amount: string;
  };
}
