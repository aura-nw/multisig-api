import { ApiProperty } from '@nestjs/swagger';

export class GetValidatorVotesByProposalIdParams {
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

  // @ApiProperty({
  //   description: 'Vote result selection',
  //   type: VOTE_ANSWER,
  // })
  // answer: VOTE_ANSWER;
}
