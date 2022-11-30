import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SimulateTxRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Encoded Messages',
    example:
      'W3sidHlwZVVybCI6Ii9jb3Ntb3Muc3Rha2luZy52MWJldGExLk1zZ0RlbGVnYXRlIiwidmFsdWUiOnsiZGVsZWdhdG9yQWRkcmVzcyI6ImF1cmExdjk1eHNlbjNkeXE1dXU0cjhxeDl5NW0yNmxrdWFhdDA3eGF6cGYiLCJ2YWxpZGF0b3JBZGRyZXNzIjoiYXVyYXZhbG9wZXIxZWR3NGx3Y3ozZXNubGd6Y3c2MHJhOG0zOGszenlnejJ4dGwycWgiLCJhbW91bnQiOnsiYW1vdW50IjoiMSIsImRlbm9tIjoidXRhdXJhIn19fV0=',
  })
  encodedMsgs: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'SafeId',
    example: '336',
  })
  safeId: string;

  //   @IsNumber()
  //   @ApiProperty({
  //     description: 'Offchain Chain Id',
  //     example: 22,
  //   })
  //   internalChainId: number;
}

export class GetSimulateAddressQuery {
  @IsNumber()
  @ApiProperty({
    description: 'Offchain Chain Id',
    example: 22,
  })
  internalChainId: number;
}
