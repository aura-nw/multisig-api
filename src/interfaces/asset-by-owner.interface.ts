export interface ICw721Asset {
  media_info: unknown;
  owner: string;
  token_id: string;
  cw721_contract: {
    smart_contract: {
      address: string;
    };
  };
}

export interface ICw20Asset {
  cw20_contract: {
    symbol: string;
    smart_contract: {
      address: string;
    };
  };
  amount: string;
  address: string;
}

export interface IAssetsWithType {
  cw721_token: ICw721Asset[];
  cw20_holder: ICw20Asset[];
}
