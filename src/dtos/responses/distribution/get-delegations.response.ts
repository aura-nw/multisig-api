import { Coin } from '@cosmjs/stargate';

export class GetDelegationsResponse {
  availableBalance: Coin;
  delegations: GetDelegationsDelegation[];
  total: {
    staked: Coin;
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
