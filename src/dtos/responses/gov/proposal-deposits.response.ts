import { ApiProperty } from '@nestjs/swagger';

export class ProposalDepositResponse {
  @ApiProperty({
    description: 'Proposal ID',
    type: Number,
  })
  proposal_id: number;

  @ApiProperty({
    description: 'Depositor address',
    type: String,
  })
  depositor: string;

  @ApiProperty({
    description: 'Transaction Hash',
    type: String,
  })
  tx_hash: string;

  @ApiProperty({
    description: 'Deposit amount',
    type: Number,
  })
  amount: number;

  @ApiProperty({
    description: 'Deposit time',
    type: String,
  })
  timestamp: string;
}
