import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetTxDetailQueryDto {
  @ApiProperty({
    description: 'Safe Address correspond to Transaction',
    type: String,
  })
  @IsString()
  safeAddress: string;

  @ApiPropertyOptional({
    description: 'Id of Multisig Transaction',
    type: Number,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  multisigTxId: number;

  @ApiPropertyOptional({
    description: 'Id of Aura Transaction',
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  auraTxId: number;
}
