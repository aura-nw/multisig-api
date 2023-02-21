import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetValidatorsParamDto {
  @ApiProperty({
    description: 'Internal Id of Chain',
    type: Number,
  })
  @IsString()
  internalChainId: number;
}
