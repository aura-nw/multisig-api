import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { CreateTransactionRequest } from './create-transaction.request';

export class ChangeSequenceTransactionRequest extends CreateTransactionRequest {
  @ApiProperty({
    description: 'Id of Multisig Transaction',
    type: Number,
  })
  @IsNumber()
  @Type(() => Number)
  oldTxId: number;
}
