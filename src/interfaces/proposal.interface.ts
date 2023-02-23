export interface IProposal {
  content: {
    '@type': string;
    title: string;
    description: string;
    changes: any[];
  };
  tally: {
    yes: string;
    abstain: string;
    no: string;
    no_with_veto: string;
  };
  final_tally_result: {
    yes: string;
    abstain: string;
    no: string;
    no_with_veto: string;
  };
  proposal_id: number;
  status: string;
  submit_time: string;
  deposit_end_time: string;
  total_deposit: [
    {
      amount: string;
      denom: string;
    },
  ];
  voting_start_time: string;
  voting_end_time: string;
  deposit: [
    {
      depositor: string;
      amount: [
        {
          denom: string;
          amount: string;
        },
      ];
    },
  ];
}
export interface IProposals {
  proposals: IProposal[];
}
