import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetSafeQuery {
  @ApiPropertyOptional({
    description: 'Optional, must fill when query by safeAddress',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  internalChainId: number;
}
export class GetSafePathParams {
  @ApiProperty({
    description: 'safeId or safeAddress',
    type: String,
  })
  @IsString()
  safeId: string;
}
