export class GetVotesByProposalIdResponse {
  votes: GetVotesVote[];
  nextKey: string;
}

export class GetVotesVote {
  voter: string;
  txHash: string;
  answer: string;
  time: string;
}
