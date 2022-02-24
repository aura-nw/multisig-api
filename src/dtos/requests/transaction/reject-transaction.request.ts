import { ApiProperty } from '@nestjs/swagger';

export class RejectTransactionRequest {
  @ApiProperty({
    description: 'Owner Address'
  })
  fromAddress: string;

  @ApiProperty({
    description: 'Offchain Transaction Id'
  })
  transactionId: number;

  @ApiProperty({
    description: 'Chain Id'
  })
  internalChainId: number;
}