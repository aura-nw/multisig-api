export interface Validator {
  description: {
    identity: string;
    moniker: string;
  };
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
}
