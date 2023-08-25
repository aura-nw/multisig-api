import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class SendTransactionRequestDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    description: 'Offchain Transaction Id',
    example: 14,
  })
  transactionId: number;
}
