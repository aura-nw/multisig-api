import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetTransactionDetailsParamDto {
  @ApiProperty({
    description: 'Tx Hash or Id of Transaction',
    type: String,
  })
  @IsString()
  internalTxHash: string;
}
