import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { VoteAnswer } from '../../../../common/constants/app.constant';

export class GetVotesByProposalIdQueryDto {
  @ApiPropertyOptional({
    description: 'Vote result selection',
    enum: VoteAnswer,
  })
  @IsOptional()
  answer: VoteAnswer;

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
