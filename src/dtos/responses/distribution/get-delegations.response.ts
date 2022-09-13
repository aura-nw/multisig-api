export class GetDelegationsResponse {
  delegations: GetDelegationsDelegation[];
}

export class GetDelegationsDelegation {
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
