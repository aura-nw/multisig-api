import { ApiProperty } from '@nestjs/swagger';

export class GetProposalDetailsParam {
  @ApiProperty({
    description: 'Internal Id of Chain',
    type: Number,
  })
  internalChainId: number;

  @ApiProperty({
    description: 'Id of the proposal',
    type: Number,
  })
  proposalId: number;
}
