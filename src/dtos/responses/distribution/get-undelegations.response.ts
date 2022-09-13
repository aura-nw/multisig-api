export class GetUndelegationsResponse {
  undelegations: GetUnDelegationsUndelegation[];
}

export class GetUnDelegationsUndelegation {
  operatorAddress: string;
  completionTime: string;
  balance: string;
}
