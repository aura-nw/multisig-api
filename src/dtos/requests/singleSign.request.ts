import { ApiProperty } from '@nestjs/swagger';

export class SingleSignRequest {
  @ApiProperty()
  multisigAddress: string;

  @ApiProperty()
  mnemonic: string;

  @ApiProperty()
  transactionId: string;
}