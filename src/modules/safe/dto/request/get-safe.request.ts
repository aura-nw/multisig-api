import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

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
export class GetSafeBalanceQuery {
  @ApiPropertyOptional({
    description: 'Optional, must fill when query by safeAddress',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  internalChainId: number;
}
export class GetSafePathParamsDto {
  @ApiProperty({
    description: 'safeId or safeAddress',
    type: String,
  })
  @IsString()
  safeId: string;
}
export class GetSafeBalancePathParamsDto {
  @ApiProperty({
    description: 'safeId or safeAddress',
    type: String,
  })
  @IsString()
  safeId: string;
}
