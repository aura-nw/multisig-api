import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfirmMultisigWalletRequest {
  @ApiProperty()
  myAddress: string;

  @ApiProperty()
  myPubkey: string;
}

export class ConfirmMultisigWalletQuery {
  @ApiProperty({
    description: 'safeId',
    type: String,
  })
  @IsString()
  safeId: string;
}
