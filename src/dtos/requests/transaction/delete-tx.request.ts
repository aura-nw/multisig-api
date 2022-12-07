import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DeleteTxRequest {
  @ApiPropertyOptional({
    description: 'Id of Multisig Transaction',
    type: Number,
  })
  @IsNumber()
  id: number;
}
