import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VOTE_ANSWER } from '../../../common/constants/app.constant';

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
  @ApiPropertyOptional({
    description: 'Vote result selection',
    enum: VOTE_ANSWER,
  })
  answer: VOTE_ANSWER;

  @ApiPropertyOptional({
    description: 'page limit',
    type: Number,
  })
  pageLimit: number;

  @ApiPropertyOptional({
    description: 'page offset',
    type: Number,
  })
  pageOffset: number;

  @ApiPropertyOptional({
    description: 'next key for faster retrieve the next batch',
    type: String,
  })
  nextKey: string;

  @ApiPropertyOptional({
    description: 'reverse the list',
    type: Boolean,
  })
  reverse: boolean;
}
