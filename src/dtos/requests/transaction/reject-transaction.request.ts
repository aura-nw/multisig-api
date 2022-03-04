import { ApiProperty } from '@nestjs/swagger';

export class RejectTransactionRequest {
  @ApiProperty({
    description: 'Owner Address',
    example: 'aura1l5k37zpxp3ukty282kn6r7kf8rqh7cve0ggq2w'
  })
  fromAddress: string;

  @ApiProperty({
    description: 'Offchain Transaction Id',
    example: 14
  })
  transactionId: number;

  @ApiProperty({
    description: 'Offchain Chain Id',
    example: 4
  })
  internalChainId: number;
}