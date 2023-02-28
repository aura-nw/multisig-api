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

  commission: {
    commission_rates: {
      rate: number;
    };
  };

  // participation:
  uptime: number;
}
