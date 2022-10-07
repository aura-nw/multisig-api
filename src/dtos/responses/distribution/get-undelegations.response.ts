import { ApiProperty } from '@nestjs/swagger';

export class GetUndelegationsResponse {
  @ApiProperty({
    example: [
      {
        operatorAddress: 'string',
        completionTime: 'string',
        balance: 'string',
      },
    ],
  })
  undelegations: GetUnDelegationsUndelegation[];
}

export class GetUnDelegationsUndelegation {
  operatorAddress: string;
  completionTime: string;
  balance: string;
}
