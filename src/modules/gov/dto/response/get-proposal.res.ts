import { ApiProperty } from '@nestjs/swagger';

export class GetProposalsTurnout {
  voted: NumberPercentage;

  votedAbstain: NumberPercentage;

  didNotVote: NumberPercentage;
}

class NumberPercentage {
  number: string;

  percent: string;
}

export class GetProposalsDeposit {
  id: string;

  denom: string;

  amount: string;
}

export class GetProposalsTally {
  yes: NumberPercentage;

  abstain: NumberPercentage;

  no: NumberPercentage;

  noWithVeto: NumberPercentage;

  mostVotedOn: {
    name: string;
    percent: string;
  };
}

export class GetProposalsResponseDto {
  @ApiProperty({
    example: [
      {
        id: 278,
        title: 'Community Pool Spend test',
        proposer: 'aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t',
        status: 'PROPOSAL_STATUS_REJECTED',
        votingStart: '2022-10-07T06:45:26.434Z',
        votingEnd: '2022-10-07T06:55:26.434Z',
        submitTime: '2022-10-07T06:45:26.434Z',
        totalDeposit: [
          {
            _id: '633fddb0f2816f001324d0b3',
            denom: 'utaura',
            amount: '10000000',
          },
        ],
        tally: {
          yes: {
            number: '27558359',
            percent: '100.00',
          },
          abstain: {
            number: '0',
            percent: '0',
          },
          no: {
            number: '0',
            percent: '0',
          },
          noWithVeto: {
            number: '0',
            percent: '0',
          },
          mostVotedOn: {
            name: 'yes',
            percent: '100.00',
          },
        },
      },
      {
        id: 277,
        title: 'Community Pool Spend test',
        proposer: 'aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t',
        status: 'PROPOSAL_STATUS_REJECTED',
        votingStart: '2022-10-07T03:08:57.177Z',
        votingEnd: '2022-10-07T03:18:57.177Z',
        submitTime: '2022-10-07T03:08:57.177Z',
        totalDeposit: [
          {
            _id: '633fddb0f2816f001324d0b0',
            denom: 'utaura',
            amount: '10000000',
          },
        ],
        tally: {
          yes: {
            number: '0',
            percent: '0',
          },
          abstain: {
            number: '0',
            percent: '0',
          },
          no: {
            number: '6558359',
            percent: '100.00',
          },
          noWithVeto: {
            number: '0',
            percent: '0',
          },
          mostVotedOn: {
            name: 'no',
            percent: '100.00',
          },
        },
      },
      {
        id: 276,
        title: 'Community Pool Spend test',
        proposer: 'aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t',
        status: 'PROPOSAL_STATUS_REJECTED',
        votingStart: '2022-10-07T02:50:28.392Z',
        votingEnd: '2022-10-07T03:00:28.392Z',
        submitTime: '2022-10-07T02:50:28.392Z',
        totalDeposit: [
          {
            _id: '633fddb0f2816f001324d0ad',
            denom: 'utaura',
            amount: '10000000',
          },
        ],
        tally: {
          yes: {
            number: '0',
            percent: '0',
          },
          abstain: {
            number: '0',
            percent: '0',
          },
          no: {
            number: '6558359',
            percent: '100.00',
          },
          noWithVeto: {
            number: '0',
            percent: '0',
          },
          mostVotedOn: {
            name: 'no',
            percent: '100.00',
          },
        },
      },
      {
        id: 275,
        title: 'Community Pool Spend test',
        proposer: 'aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t',
        status: 'PROPOSAL_STATUS_REJECTED',
        votingStart: '2022-10-07T02:40:02.490Z',
        votingEnd: '2022-10-07T02:50:02.490Z',
        submitTime: '2022-10-07T02:40:02.490Z',
        totalDeposit: [
          {
            _id: '633fddb0f2816f001324d0aa',
            denom: 'utaura',
            amount: '10000000',
          },
        ],
        tally: {
          yes: {
            number: '0',
            percent: '0',
          },
          abstain: {
            number: '0',
            percent: '0',
          },
          no: {
            number: '6558359',
            percent: '100.00',
          },
          noWithVeto: {
            number: '0',
            percent: '0',
          },
          mostVotedOn: {
            name: 'no',
            percent: '100.00',
          },
        },
      },
      {
        id: 274,
        title: 'Community Pool Spend test',
        proposer: 'aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t',
        status: 'PROPOSAL_STATUS_REJECTED',
        votingStart: '2022-10-07T01:56:39.288Z',
        votingEnd: '2022-10-07T02:06:39.288Z',
        submitTime: '2022-10-07T01:56:39.288Z',
        totalDeposit: [
          {
            _id: '633fddb0f2816f001324d0a7',
            denom: 'utaura',
            amount: '10000000',
          },
        ],
        tally: {
          yes: {
            number: '7558359',
            percent: '100.00',
          },
          abstain: {
            number: '0',
            percent: '0',
          },
          no: {
            number: '0',
            percent: '0',
          },
          noWithVeto: {
            number: '0',
            percent: '0',
          },
          mostVotedOn: {
            name: 'yes',
            percent: '100.00',
          },
        },
      },
      {
        id: 273,
        title: 'Community Pool Spend test',
        proposer: 'aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t',
        status: 'PROPOSAL_STATUS_REJECTED',
        votingStart: '2022-10-05T10:48:50.089Z',
        votingEnd: '2022-10-05T10:58:50.089Z',
        submitTime: '2022-10-05T10:48:50.089Z',
        totalDeposit: [
          {
            _id: '633fddb0f2816f001324d0a4',
            denom: 'utaura',
            amount: '10000000',
          },
        ],
        tally: {
          yes: {
            number: '0',
            percent: '0',
          },
          abstain: {
            number: '0',
            percent: '0',
          },
          no: {
            number: '0',
            percent: '0',
          },
          noWithVeto: {
            number: '0',
            percent: '0',
          },
          mostVotedOn: {
            name: 'yes',
            percent: '0',
          },
        },
      },
      {
        id: 272,
        title: 'Community Pool Spend test',
        proposer: 'aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t',
        status: 'PROPOSAL_STATUS_REJECTED',
        votingStart: '2022-10-05T10:48:13.521Z',
        votingEnd: '2022-10-05T10:58:13.521Z',
        submitTime: '2022-10-05T10:48:13.521Z',
        totalDeposit: [
          {
            _id: '633fddb0f2816f001324d0a1',
            denom: 'utaura',
            amount: '10000000',
          },
        ],
        tally: {
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
      },
    ],
  })
  proposals: GetProposalsProposalDto[];
}

export class GetProposalsProposalDto {
  @ApiProperty({
    example: 272,
  })
  id: number;

  @ApiProperty({
    example: 'Community Pool Spend test',
  })
  title: string;

  @ApiProperty({
    example: 'PROPOSAL_STATUS_REJECTED',
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
