import { NumberPercentage } from './get-proposal.type';

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
