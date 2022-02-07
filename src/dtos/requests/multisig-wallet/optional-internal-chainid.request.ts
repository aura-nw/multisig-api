import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class OptionalInternalChainId {
  @ApiPropertyOptional({
    description: 'Optional, fill when query by address',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  internalChainId: number;
}