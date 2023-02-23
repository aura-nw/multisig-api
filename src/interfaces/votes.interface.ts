export interface IVote {
  voter_address: string;
  proposal_id: number;
  answer: string;
  txhash: string;
  timestamp: string;
}
export interface IVotes {
  votes: IVote[];
  nextKey: string;
}
