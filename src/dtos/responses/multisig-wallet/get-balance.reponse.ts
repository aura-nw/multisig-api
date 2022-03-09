import { Coin } from '@cosmjs/amino';
import { ApiProperty } from '@nestjs/swagger';

export class GetBalanceResponse {
  @ApiProperty({
    example: [
      {
        denom: 'uaura',
        amount: '0',
      },
    ],
  })
  balances: Coin[];
}
