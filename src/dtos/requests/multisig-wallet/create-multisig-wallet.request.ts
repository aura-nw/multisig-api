import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CreateMultisigWalletRequest {
  @IsString()
  @ApiProperty({ type: [String] })
  otherOwnersAddress: string[];

  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  threshold: number;

  @IsNumber()
  @ApiProperty()
  @Type(() => Number)
  internalChainId: number;
}
