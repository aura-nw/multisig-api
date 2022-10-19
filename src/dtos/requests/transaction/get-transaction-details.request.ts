import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetTransactionDetailsParam {
  @ApiProperty({
    description: 'Tx Hash or Id of Transaction',
    type: String,
  })
  @IsString()
  internalTxHash: string;

  @ApiProperty({
    description: 'Safe Address correspond to Transaction',
    type: String,
  })
  @IsString()
  safeAddress: string;
}

export class GetTxDetailQuery {
  @ApiPropertyOptional({
    description: 'Direction of Transaction',
    type: String,
  })
  @IsString()
  direction: string;
}
