import { ApiProperty } from '@nestjs/swagger';
import { UnDelegationDetailDto } from './undelegation-detail.res';

export class GetUndelegationsResponseDto {
  @ApiProperty({
    example: [
      {
        operatorAddress: 'string',
        completionTime: 'string',
        balance: 'string',
      },
    ],
  })
  undelegations: UnDelegationDetailDto[];
}
