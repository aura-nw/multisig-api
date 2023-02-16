import { Coin } from '@cosmjs/stargate';
import { ApiProperty } from '@nestjs/swagger';

export class GetDelegationResponseDto {
  @ApiProperty({
    example: {
      validator: {
        operatorAddress: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
        votingPower: {
          percent_voting_power: 93.478854,
          tokens: {
            amount: '32587434807',
            denom: 'utaura',
          },
        },
        commission: '0.100000000000000000',
        delegators: 42,
      },
      delegation: {
        claimedReward: {
          denom: 'aura',
          amount: '1',
        },
        delegatableBalance: {
          denom: 'utaura',
          amount: '7731500',
        },
        delegationBalance: {
          denom: 'utaura',
          amount: '1000000',
        },
        pendingReward: {
          denom: 'utaura',
          amount: '829781.160415034632000000',
        },
      },
    },
  })
  validator: {
    operatorAddress: string;
    votingPower: {
      percent_voting_power: number;
      tokens: Coin;
    };
    delegators: number;
    commission: string;
  };
  delegation: {
    delegationBalance: Coin;
    delegatableBalance: Coin;
    claimedReward: Coin;
    pendingReward: Coin;
  };
}
