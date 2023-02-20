import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetSafeQueryDto {
  @ApiPropertyOptional({
    description: 'Optional, must fill when query by safeAddress',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  internalChainId: number;
}
