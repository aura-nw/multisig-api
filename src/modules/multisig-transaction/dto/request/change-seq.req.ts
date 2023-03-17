import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { CreateTransactionRequestDto } from './create-transaction.req';

export class ChangeSequenceTransactionRequestDto extends CreateTransactionRequestDto {
  @ApiProperty({
    description: 'Id of Multisig Transaction',
    type: Number,
  })
  @IsNumber()
  @Type(() => Number)
  oldTxId: number;
}
