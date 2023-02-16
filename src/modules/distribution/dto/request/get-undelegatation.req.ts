import { ApiProperty } from '@nestjs/swagger';

export class GetUndelegationsParamDto {
  @ApiProperty({
    description: 'Delegator Address',
    type: String,
  })
  delegatorAddress: string;

  @ApiProperty({
    description: 'Internal Id of Chain',
    type: Number,
  })
  internalChainId: number;
}
