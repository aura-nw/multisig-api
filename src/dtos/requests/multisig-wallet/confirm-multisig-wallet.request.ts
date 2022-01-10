import { ApiProperty } from '@nestjs/swagger';

export class ConfirmMultisigWalletRequest {
  @ApiProperty()
  myAddress: string;

  @ApiProperty()
  myPubkey: string;
}
