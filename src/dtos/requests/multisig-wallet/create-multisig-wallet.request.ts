import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateMultisigWalletRequest {
  @IsArray()
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
