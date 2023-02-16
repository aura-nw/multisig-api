import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber } from 'class-validator';

export class CreateMultisigWalletRequestDto {
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
