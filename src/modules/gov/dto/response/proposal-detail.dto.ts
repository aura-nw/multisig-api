import { ApiProperty } from '@nestjs/swagger';
import { GetProposalsTally } from './get-proposal-tally.res';
import { GetProposalsDeposit } from './get-proposal.type';
import { GetProposalsTurnout } from './get-proposals-turnout.res';

export class ProposalDetailDto {
  @ApiProperty({
    example: 272,
  })
  id: number;

  @ApiProperty({
    example: 'Community Pool Spend test',
  })
  title: string;

  @ApiProperty({
    example: 'ProposalStatus_REJECTED',
  })
  status: string;

  @ApiProperty({
    example: 'aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t',
  })
  proposer: string;

  @ApiProperty({
    example: '2022-10-05T10:48:13.521Z',
  })
  votingStart: string;

  @ApiProperty({
    example: '2022-10-05T10:58:13.521Z',
  })
  votingEnd: string;

  @ApiProperty({
    example: '2022-10-05T10:48:13.521Z',
  })
  submitTime: string;

  @ApiProperty({
    example: [
      {
        _id: '633fddb0f2816f001324d0a1',
        denom: 'utaura',
        amount: '10000000',
      },
    ],
  })
  totalDeposit: GetProposalsDeposit[];

  @ApiProperty({
    example: {
      yes: {
        number: '7100000000',
        percent: '23.32',
      },
      abstain: {
        number: '10091550000',
        percent: '33.15',
      },
      no: {
        number: '0',
        percent: '0',
      },
      noWithVeto: {
        number: '13249500000',
        percent: '43.53',
      },
      mostVotedOn: {
        name: 'no_with_veto',
        percent: '43.53',
      },
    },
  })
  tally: GetProposalsTally;

  @ApiProperty({
    example: '2022-10-07T03:00:28.392Z',
  })
  depositEndTime?: string;

  @ApiProperty({
    example: 'Hello World',
  })
  description?: string;

  @ApiProperty({
    example: {
      voted: {
        number: '6558359',
        percent: '0.01',
      },
      votedAbstain: {
        number: '0',
        percent: '0',
      },
      didNotVote: {
        number: '48851966033',
        percent: '99.99',
      },
    },
  })
  turnout?: GetProposalsTurnout;

  @ApiProperty({
    example: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
  })
  type?: string;
}
