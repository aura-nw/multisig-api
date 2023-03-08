import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetContractStatusQueryDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    example: 22,
    description: 'Internal Id of Chain',
  })
  internalChainId: number;
}
