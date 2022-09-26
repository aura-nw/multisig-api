import { Coin } from '@cosmjs/stargate';

export class GetDelegationsResponse {
  delegations: GetDelegationsDelegation[];
  total: {
    staked: number;
    reward: Coin[];
  };
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
