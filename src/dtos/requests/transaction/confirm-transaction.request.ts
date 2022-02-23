import { ApiProperty } from '@nestjs/swagger';

export class ConfirmTransactionRequest {
  @ApiProperty()
  fromAddress: string;

  @ApiProperty()
  transactionId: number;

  @ApiProperty()
  bodyBytes: string;

  @ApiProperty()
  signature: string;

  @ApiProperty()
  internalChainId: number;
}