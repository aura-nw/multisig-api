import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DeleteTxRequest {
  @ApiProperty({
    description: 'Id of Multisig Transaction',
    type: Number,
  })
  @IsNumber()
  id: number;
}
