export interface IValidatorDescription {
  identity: string;
  moniker: string;
}
export interface IValidator {
  description: IValidatorDescription;
  operator_address: string;
  status: string;
  percent_voting_power: string;
  tokens: string;
  commission: {
    commission_rates: {
      rate: string;
    };
  };
  number_delegators: string;
  uptime: number;
}
