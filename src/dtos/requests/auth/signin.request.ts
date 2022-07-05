import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthRequest {
  @ApiProperty()
  @IsNotEmpty()
  pubkey: string;

  @ApiProperty()
  @IsNotEmpty()
  data: string;

  @ApiProperty()
  @IsNotEmpty()
  signature: string;
}
