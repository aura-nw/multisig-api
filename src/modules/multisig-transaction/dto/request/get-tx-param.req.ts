import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetTransactionDetailsParamDto {
  @ApiProperty({
    description: 'Tx Hash or Id of Transaction',
    type: String,
  })
  @IsString()
  internalTxHash: string;
}
