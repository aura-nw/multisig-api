import { ApiProperty } from '@nestjs/swagger';

export class GetDelegationsParamDto {
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
