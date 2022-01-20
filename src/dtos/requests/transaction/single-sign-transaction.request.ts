import { ApiProperty } from '@nestjs/swagger';

export class SingleSignTransactionRequest {
  @ApiProperty()
  fromAddress: string;

  @ApiProperty()
  transactionId: number;

  @ApiProperty()
  bodyBytes: string;

  @ApiProperty()
  signature: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  chainId: number;
}