import { DecCoin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { DelegationDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/distribution';
import { QueryDelegationTotalRewardsResponse } from 'cosmjs-types/cosmos/distribution/v1beta1/query';

export class GetDelegatorRewardsResponse
  implements QueryDelegationTotalRewardsResponse
{
  @IsArray()
  @ApiProperty({
    example: [
      {
        validator_address: 'auravaloper182lurpfs7xcle90hcjkmtnjf2efzx64ffen499',
        reward: [
          {
            denom: 'uaura',
            amount: '515286.099925607666000000',
          },
        ],
      },
    ],
  })
  rewards: DelegationDelegatorReward[];

  @IsArray()
  @ApiProperty({
    example: [
      {
        denom: 'uaura',
        amount: '515286.099925607666000000',
      },
    ],
  })
  total: DecCoin[];
}
