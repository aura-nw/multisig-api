export interface ICw721Asset {
  asset_info: {
    data: {
      access: {
        approvals: unknown[];
        owner: string;
      };
      info: {
        token_uri: string;
        extension: unknown;
      };
    };
  };
  history: unknown[];
  _id: string;
  asset_id: string;
  code_id: string;
  contract_address: string;
  token_id: string;
  owner: string;
  media_link: string;
  is_burned: boolean;
  metadata: unknown;
}

export interface ICw20Asset {
  asset_info: {
    data: {
      name: string;
      symbol: string;
      decimals: number;
      total_supply: string;
    };
  };
  _id: string;
  asset_id: string;
  code_id: string;
  contract_address: string;
  owner: number;
  balance: number;
  percent_hold: number;
}

// export interface IAssetsWithType {
//   CW20?: {
//     asset: ICw20Asset[];
//     count: number;
//   };
//   CW721?: {
//     asset: ICw721Asset[];
//     count: number;
//   };
// }

export interface IAssetsWithType {
  cw20_holder?: [
    {
      cw20_contract: {
        symbol: string;
        smart_contract: {
          address: string;
        };
      };
      amount: string;
      address: string;
    },
  ];
  cw721_token?: [
    {
      media_info: any;
      owner: string;
      token_id: string;
      cw721_contract: {
        smart_contract: {
          address: string;
        };
      };
    },
  ];
}

export interface IAssets {
  assets: IAssetsWithType;
  nextKey: string;
}
