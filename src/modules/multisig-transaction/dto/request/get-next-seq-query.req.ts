import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetNextSeqQueryDto {
  @IsNumber()
  @ApiProperty({
    description: 'Safe Id',
    example: 1,
  })
  @Type(() => Number)
  safeId: number;
}
