import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetTransactionDetailsParam {
  @ApiProperty({
    description: 'Tx Hash or Id of Transaction',
    type: String,
  })
  @IsString()
  internalTxHash: string;
}

export class GetTxDetailQuery {
  @ApiProperty({
    description: 'Safe Address correspond to Transaction',
    type: String,
  })
  @IsString()
  safeAddress: string;

  @ApiPropertyOptional({
    description: 'Id of Multisig Transaction',
    type: Number,
  })
  @IsString()
  multisigTxId: number;

  @ApiPropertyOptional({
    description: 'Id of Aura Transaction',
    type: Number,
  })
  @IsString()
  auraTxId: number;
}
