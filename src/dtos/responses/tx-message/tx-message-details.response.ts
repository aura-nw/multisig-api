import { ApiProperty } from '@nestjs/swagger';

export class TxMessageDetailsResponse {
  @ApiProperty({
    example: 1,
  })
  TxId: number;

  @ApiProperty({
    example: 'aura214124tgjnfvjieh4u5jwogfve5th23fe4tbe5th',
  })
  FromAddress: string;

  @ApiProperty({
    example: 'aura214124tgjnfvjieh4u5jwogfve5th23fe4tbe5th',
  })
  ToAddress: string;

  @ApiProperty({
    example: 100,
  })
  Amount: number;

  @ApiProperty({
    example: 'uaura',
  })
  Denom: string;
}
