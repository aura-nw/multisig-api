import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { VOTE_ANSWER } from '../../../common/constants/app.constant';

export class GetVotesByProposalIdParamDto {
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

export class GetVotesByProposalIdQueryDto {
  @ApiPropertyOptional({
    description: 'Vote result selection',
    enum: VOTE_ANSWER,
  })
  @IsOptional()
  answer: VOTE_ANSWER;

  @ApiPropertyOptional({
    description: 'page limit',
    type: Number,
  })
  @IsOptional()
  pageLimit: number;

  @ApiPropertyOptional({
    description: 'page offset',
    type: Number,
  })
  @IsOptional()
  pageOffset: number;

  @ApiPropertyOptional({
    description: 'next key for faster retrieve the next batch',
    type: String,
  })
  @IsOptional()
  nextKey: string;

  @ApiPropertyOptional({
    description: 'reverse the list',
    type: Boolean,
  })
  @IsOptional()
  reverse: boolean;
}
