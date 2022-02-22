import { ApiProperty } from '@nestjs/swagger';

export class RejectTransactionRequest {
  @ApiProperty()
  fromAddress: string;

  @ApiProperty()
  transactionId: number;

  @ApiProperty()
  internalChainId: number;
}