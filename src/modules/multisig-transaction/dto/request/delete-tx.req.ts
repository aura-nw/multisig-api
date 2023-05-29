import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DeleteTxRequestDto {
  @ApiProperty({
    description: 'Id of Multisig Transaction',
    type: Number,
  })
  @IsNumber()
  @Type(() => Number)
  id: number;
}
