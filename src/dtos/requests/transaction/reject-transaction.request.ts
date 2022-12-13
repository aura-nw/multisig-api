import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class RejectTransactionRequest {
  @IsNumber()
  @ApiProperty({
    description: 'Offchain Transaction Id',
    example: 14,
  })
  transactionId: number;

  @IsNumber()
  @ApiProperty({
    description: 'Offchain Chain Id',
    example: 4,
  })
  @Type(() => Number)
  internalChainId: number;
}
