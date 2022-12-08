import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { CreateTransactionRequest } from './create-transaction.request';

export class ChangeSequenceTransactionRequest extends CreateTransactionRequest {
  @ApiProperty({
    description: 'Id of Multisig Transaction',
    type: Number,
  })
  @IsNumber()
  oldTxId: number;
}
