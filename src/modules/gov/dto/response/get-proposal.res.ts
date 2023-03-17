import { ApiProperty } from '@nestjs/swagger';
import { ProposalDetailDto } from './proposal-detail.dto';

export class GetProposalsResponseDto {
  @ApiProperty({
    example: [
      {
        id: 278,
        title: 'Community Pool Spend test',
        proposer: 'aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t',
        status: 'ProposalStatus_REJECTED',
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
        status: 'ProposalStatus_REJECTED',
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
        status: 'ProposalStatus_REJECTED',
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
        status: 'ProposalStatus_REJECTED',
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
        status: 'ProposalStatus_REJECTED',
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
        status: 'ProposalStatus_REJECTED',
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
        status: 'ProposalStatus_REJECTED',
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
  proposals: ProposalDetailDto[];
}
