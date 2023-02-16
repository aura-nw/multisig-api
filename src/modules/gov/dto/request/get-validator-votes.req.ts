import { ApiProperty } from '@nestjs/swagger';

export class GetValidatorVotesDto {
  @ApiProperty({
    description: 'Internal Id of Chain',
    type: Number,
  })
  internalChainId: number;

  @ApiProperty({
    description: 'Id of Proposal',
    type: Number,
  })
  proposalId: number;
}
