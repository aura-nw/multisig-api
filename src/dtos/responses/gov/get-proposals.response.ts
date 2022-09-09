export class GetProposalsResponse {
  proposals: GetProposalsProposal[];
}

export class GetProposalsProposal {
  id: number;
  title: string;
  status: string;
  proposer: string;
  votingStart: string;
  votingEnd: string;
  submitTime: string;
  totalDeposit: GetProposalsDeposit[];
  tally: GetProposalsTally;
  depositEndTime?: string;
  description?: string;
  turnout?: GetProposalsTurnout;
  type?: string;
}

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
