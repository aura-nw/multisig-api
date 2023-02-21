export class ValidatorInfoDto {
  validator: string;

  operatorAddress: string;

  status: string;

  votingPower: {
    number: string;
    percentage: string;
  };

  description: {
    moniker: string;
    picture: string;
  };

  commission: any;

  // participation:
  uptime: number;
}
