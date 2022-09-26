import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class GetDelegatorRewardsParam {
  @ApiProperty({
    description: 'Delegator Address',
    type: String,
  })
  @IsString()
  delegatorAddress: string;

  @ApiProperty({
    description: 'Internal Id of Chain',
    type: Number,
  })
  @IsNumber()
  internalChainId: number;
}
