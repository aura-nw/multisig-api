export interface IProposal {
  proposal_id: number;
  proposer_address: string;
  voting_start_time: string;
  voting_end_time: string;
  submit_time: string;
  deposit_end_time: string;
  type: string;
  title: string;
  description: string;
  content: {
    '@type': string;
    title: string;
    description: string;
  };
  status: string;
  tally: {
    yes: string;
    abstain: string;
    no: string;
    no_with_veto: string;
  };
  initial_deposit: [
    {
      denom: string;
      amount: string;
    },
  ];
  total_deposit: [
    {
      id: string;
      denom: string;
      amount: string;
    },
  ];
  turnout: number;
  count_vote: {
    yes: number;
    no: number;
    abstain: number;
    no_with_veto: number;
    unspecified: number;
  };
  custom_info: {
    chain_id: string;
  };
}

export interface IProposals {
  proposal: IProposal[];
}
