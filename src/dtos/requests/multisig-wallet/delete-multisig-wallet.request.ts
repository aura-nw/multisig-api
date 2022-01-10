import { ApiProperty } from '@nestjs/swagger';

export class DeleteMultisigWalletRequest {
  @ApiProperty()
  myAddress: string;
}
