export class GetProposalsResponse {
  proposals: GetProposalsProposal[];
}

export class GetProposalsProposal {
  id: number;
  title: string;
  status: string;
  votingStart: string;
  votingEnd: string;
  submitTime: string;
  totalDeposit: GetProposalsDeposit[];
  tally: GetProposalsTally;
}

export class GetProposalsDeposit {
  id: string;
  denom: string;
  amount: string;
}

export class GetProposalsTally {
  yes: TallyOption;
  abstain: TallyOption;
  no: TallyOption;
  noWithVeto: TallyOption;
  mostVotedOn: {
    name: string;
    percent: number;
  };
}

class TallyOption {
  number: string;
  percent: number;
}
