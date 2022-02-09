import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetSafeQuery {
  // @ApiProperty({
  //   description: 'safeId or safeAddress',
  //   type: String,
  // })
  // @IsString()
  // safeId: string;

  @ApiPropertyOptional({
    description: 'Optional, must fill when query by safeAddress',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  internalChainId: number;
}
