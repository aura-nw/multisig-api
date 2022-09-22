export class GetValidatorVotesByProposalIdResponse {
  votes: GetValidatorVotesVote[];
  nextKey: string;
}

export class GetValidatorVotesVote {
  validator: string;
  txHash: string;
  answer: string;
  time: string;
}
