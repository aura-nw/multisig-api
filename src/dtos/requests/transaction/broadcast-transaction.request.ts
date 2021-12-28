import { ApiProperty } from '@nestjs/swagger';

export class BroadcastTransactionRequest {

  @ApiProperty()
  multisigPubkey: string;

  @ApiProperty()
  multisigAddress: string;

  @ApiProperty({type: [String]})
  pubkeys: string[];

  @ApiProperty({type: [String]})
  signature: string[];

  @ApiProperty()
  bodyBytes: string;
}