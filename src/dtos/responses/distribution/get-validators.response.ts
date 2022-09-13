export class GetValidatorsResponse {
  validators: GetValidatorsValidator[];
}

export class GetValidatorsValidator {
  validator: string;
  operatorAddress: string;
  status: string;
  votingPower: {
    number: string;
    percentage: string;
  };
  commission: any;
  // participation:
  uptime: number;
}
