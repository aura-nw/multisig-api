import { ApiProperty } from '@nestjs/swagger';
import { DelegationResponse } from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import { QueryValidatorDelegationsResponse } from 'cosmjs-types/cosmos/staking/v1beta1/query';
import { PageResponse } from 'cosmjs-types/cosmos/base/query/v1beta1/pagination';

export class GetDelegationInformationResponse
  implements QueryValidatorDelegationsResponse
{
  @ApiProperty({
    example: [
      {
        delegation: {
          delegator_address: 'aura17vsg5vvsc554wst3p0paczcd7xyn5qdl5xmt9w',
          validator_address:
            'auravaloper182lurpfs7xcle90hcjkmtnjf2efzx64ffen499',
          shares: '1000000.000000000000000000',
        },
        balance: {
          denom: 'uaura',
          amount: '1000000',
        },
      },
      {
        delegation: {
          delegator_address: 'aura17vsg5vvsc554wst3p0paczcd7xyn5qdl5xmt9w',
          validator_address:
            'auravaloper1mvm4f62j96dw79gvc3zhyuef7wh453ca8rltx5',
          shares: '1000000.000000000000000000',
        },
        balance: {
          denom: 'uaura',
          amount: '1000000',
        },
      },
    ],
  })
  delegationResponses: DelegationResponse[];

  @ApiProperty({
    example: {
      next_key: 'FOPL312KH6WzHm1YyW28y4kdiG2G',
      total: '0',
    },
  })
  pagination?: PageResponse;
}
