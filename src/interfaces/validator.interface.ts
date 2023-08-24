export interface IValidatorDescription {
  identity: string;
  moniker: string;
}

export interface IValidator {
  operator_address: string;
  account_address: string;
  consensus_address: string;
  consensus_hex_address: string;
  consensus_pubkey: {
    type: string;
    key: string;
  };
  jailed: boolean;
  status: string;
  tokens: string;
  delegator_shares: string;
  description: IValidatorDescription;
  unbonding_height: number;
  unbonding_time: string;
  commission: {
    commission_rates: {
      rate: string;
    };
  };
  min_self_delegation: string;
  uptime: number;
  self_delegation_balance: string;
  percent_voting_power: number;
  start_height: number;
  index_offset: number;
  jailed_until: string;
  tombstoned: boolean;
  missed_blocks_counter: number;
  delegators_count: number;
  delegators_last_height: number;
  image_url: string;
}
