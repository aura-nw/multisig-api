import { ApiProperty } from '@nestjs/swagger';

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
  undelegations: GetUnDelegationsUndelegationDto[];
}

export class GetUnDelegationsUndelegationDto {
  operatorAddress: string;
  completionTime: string;
  balance: string;
}
