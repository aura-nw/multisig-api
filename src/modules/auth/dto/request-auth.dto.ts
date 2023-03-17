import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RequestAuthDto {
  @ApiProperty()
  @IsNotEmpty()
  pubkey: string;

  @ApiProperty()
  @IsNotEmpty()
  data: string;

  @ApiProperty()
  @IsNotEmpty()
  signature: string;

  @ApiProperty()
  @IsNotEmpty()
  internalChainId: number;
}
