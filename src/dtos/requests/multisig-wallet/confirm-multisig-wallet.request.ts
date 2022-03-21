import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfirmMultisigWalletRequest {
  @IsString()
  @ApiProperty()
  myAddress: string;

  @IsString()
  @ApiProperty()
  myPubkey: string;
}

export class ConfirmSafePathParams {
  @ApiProperty({
    description: 'safeId',
    type: String,
  })
  @IsString()
  safeId: string;
}
