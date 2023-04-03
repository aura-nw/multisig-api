export interface IAuraContractDetail {
  id: number;
  height: number;
  code_id: number;
  contract_name: string;
  contract_address: string;
  creator_address: string;
  contract_hash: string;
  tx_hash: string;
  url: string;
  instantiate_msg_schema: string;
  query_msg_schema: string;
  execute_msg_schema: string;
  contract_match: string;
  contract_verification: string;
  compiler_version: string;
  s3_location: string;
  reference_code_id: string;
  mainnet_upload_status: string;
  token_name: string;
  token_symbol: string;
  num_tokens: string;
  verified_at: string;
  project_name: string;
  balance: number;
  decimals: number;
}

export interface IAuraScanResponseDto<T> {
  meta: unknown;
  data: T;
}
