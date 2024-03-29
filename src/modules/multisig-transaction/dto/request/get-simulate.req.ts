import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SimulateTxRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Encoded Messages',
    example:
      'W3sidHlwZVVybCI6Ii9jb3Ntb3Muc3Rha2luZy52MWJldGExLk1zZ0RlbGVnYXRlIiwidmFsdWUiOnsiZGVsZWdhdG9yQWRkcmVzcyI6ImF1cmExcDYwY2pzc2FjZXUwcThmOHQ5OWU4MDlnaDJueHJxOXJtcDVrYW0iLCJ2YWxpZGF0b3JBZGRyZXNzIjoiYXVyYXZhbG9wZXIxZWR3NGx3Y3ozZXNubGd6Y3c2MHJhOG0zOGszenlnejJ4dGwycWgiLCJhbW91bnQiOnsiYW1vdW50IjoiMSIsImRlbm9tIjoidXRhdXJhIn19fV0=',
  })
  encodedMsgs: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  @ApiProperty({
    description: 'SafeId',
    example: 336,
  })
  safeId: number;
}
