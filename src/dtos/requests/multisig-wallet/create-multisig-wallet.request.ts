import { ApiProperty } from '@nestjs/swagger';

export class CreateMultisigWalletRequest {
  @ApiProperty()
  creatorAddress: string;

  @ApiProperty()
  creatorPubkey: string;

  @ApiProperty({ type: [String] })
  otherOwnersAddress: string[];

  @ApiProperty()
  threshold: number;

  @ApiProperty()
  chainId: number;
}
