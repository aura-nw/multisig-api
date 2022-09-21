import { ApiProperty } from '@nestjs/swagger';
import { VOTE_ANSWER } from 'src/common/constants/app.constant';

export class GetVotesByProposalIdParams {
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

export class GetVotesByProposalIdQuery {
  @ApiProperty({
    description: 'Vote result selection',
    type: VOTE_ANSWER,
  })
  answer: VOTE_ANSWER;

  @ApiProperty({
    description: 'page limit',
    type: Number,
  })
  pageLimit: number;

  @ApiProperty({
    description: 'page offset',
    type: Number,
  })
  pageOffset: number;

  @ApiProperty({
    description: 'next key for faster retrieve the next batch',
    type: String,
  })
  nextKey: string;

  @ApiProperty({
    description: 'reverse the list',
    type: Boolean,
  })
  reverse: boolean;
}
