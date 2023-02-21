import { Coin } from '@cosmjs/stargate';
import { ApiProperty } from '@nestjs/swagger';
import { DelegationDetailDto } from './delegation-detail.res';

export class GetDelegationsResponseDto {
  @ApiProperty({
    example: {
      _id: '633fd61bb20ef40015eb701a',
      denom: 'utaura',
      amount: '7731500',
    },
  })
  availableBalance: Coin;

  @ApiProperty({
    example: [
      {
        operatorAddress: 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx',
        balance: {
          denom: 'utaura',
          amount: '1000000',
        },
        reward: [],
      },
      {
        operatorAddress: 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh',
        balance: {
          denom: 'utaura',
          amount: '1000000',
        },
        reward: [
          {
            denom: 'utaura',
            amount: '147904.684833399549000000',
          },
        ],
      },
    ],
  })
  delegations: DelegationDetailDto[];

  @ApiProperty({
    example: {
      staked: {
        amount: '2000000',
        denom: 'utaura',
      },
      reward: [
        {
          denom: 'utaura',
          amount: '147904.684833399549000000',
        },
      ],
    },
  })
  total: {
    staked: Coin;
    reward: Coin[];
  };
}
