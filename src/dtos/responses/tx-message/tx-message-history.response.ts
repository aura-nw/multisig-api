import { ApiProperty } from '@nestjs/swagger';

export class TxMessageHistoryResponse {
  @ApiProperty({
    example: 1,
  })
  TxId: number;

  @ApiProperty({
    example: 100,
  })
  Amount: number;

  @ApiProperty({
    example: 'uaura',
  })
  Denom: string;
}
