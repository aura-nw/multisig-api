import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateMultisigWalletRequest {
  @IsString()
  @ApiProperty()
  creatorAddress: string;

  @IsString()
  @ApiProperty()
  creatorPubkey: string;

  @IsString()
  @ApiProperty({ type: [String] })
  otherOwnersAddress: string[];

  @IsNumber()
  @ApiProperty()
  threshold: number;

  @IsNumber()
  @ApiProperty()
  internalChainId: number;
}
