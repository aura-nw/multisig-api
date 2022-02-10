import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteMultisigWalletRequest {
  @ApiProperty()
  myAddress: string;
}

export class DeleteSafePathParams {
  @ApiProperty({
    description: 'safeId',
    type: String,
  })
  @IsString()
  safeId: string;
}
