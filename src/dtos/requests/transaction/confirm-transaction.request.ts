import { ApiProperty } from '@nestjs/swagger';

export class ConfirmTransactionRequest {
  @ApiProperty({
    description: 'Owner address'
  })
  fromAddress: string;

  @ApiProperty({
    description: 'Offchain Transaction Id'
  })
  transactionId: number;

  @ApiProperty({
    description: 'Owner sign transaction via wallet then get bodyBytes'
  })
  bodyBytes: string;

  @ApiProperty({
    description: 'Owner sign transaction via wallet then get transaction'
  })
  signature: string;

  @ApiProperty({
    description: 'Chain Id'
  })
  internalChainId: number;
}