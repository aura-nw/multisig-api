import { ApiProperty } from '@nestjs/swagger';
import { QueryProposalsResponse } from 'cosmjs-types/cosmos/gov/v1beta1/query';
import { Proposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { PageResponse } from 'cosmjs-types/cosmos/base/query/v1beta1/pagination';
export class GetProposalsResponse implements QueryProposalsResponse {
  @ApiProperty({
    example: [
      {
        proposal_id: '1',
        content: {
          '@type': '/cosmos.params.v1beta1.ParameterChangeProposal',
          title: 'Change blocks_per_year param proposal',
          description: 'Increase number of estimated blocks per year',
          changes: [
            {
              subspace: 'mint',
              key: 'BlocksPerYear',
              value: '"10000000"',
            },
          ],
        },
        status: 'PROPOSAL_STATUS_REJECTED',
        final_tally_result: {
          yes: '2500000',
          abstain: '0',
          no: '15000000',
          no_with_veto: '3490006',
        },
        submit_time: '2022-04-28T08:26:39.678661427Z',
        deposit_end_time: '2022-04-30T08:26:39.678661427Z',
        total_deposit: [
          {
            denom: 'uaura',
            amount: '1000001',
          },
        ],
        voting_start_time: '2022-04-28T09:55:02.465782123Z',
        voting_end_time: '2022-04-30T09:55:02.465782123Z',
      },
      {
        proposal_id: '2',
        content: {
          '@type': '/cosmos.params.v1beta1.ParameterChangeProposal',
          title: 'Change threshold param proposal',
          description: 'Increase gov threshold',
          changes: [
            {
              subspace: 'gov',
              key: 'tallyparams',
              value: '{"threshold":"0.600000000000000000"}',
            },
          ],
        },
        status: 'PROPOSAL_STATUS_REJECTED',
        final_tally_result: {
          yes: '9500000',
          abstain: '0',
          no: '1490006',
          no_with_veto: '2000000',
        },
        submit_time: '2022-04-28T10:26:41.540074567Z',
        deposit_end_time: '2022-04-30T10:26:41.540074567Z',
        total_deposit: [
          {
            denom: 'uaura',
            amount: '1000001',
          },
        ],
        voting_start_time: '2022-04-28T10:36:37.626116630Z',
        voting_end_time: '2022-04-30T10:36:37.626116630Z',
      },
    ],
  })
  proposals: Proposal[];
  pagination?: PageResponse;
}
