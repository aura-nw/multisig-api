import { ApiProperty } from '@nestjs/swagger';

export class TxMessageHistoryResponseDto {
  @ApiProperty({
    example: 1,
  })
  AuraTxId: number;

  @ApiProperty({
    example: 100,
  })
  Amount: number;
}
