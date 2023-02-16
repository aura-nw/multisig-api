import { ApiProperty } from '@nestjs/swagger';

export class GetProposalByIdDto {
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
