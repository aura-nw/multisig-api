export interface ITxEvent {
  type: string;
  attributes: [
    {
      key: string;
      value: string;
    },
  ];
}

export interface ITransaction {
  tx_response: {
    txhash: string;
    timestamp: string;
    logs: [
      {
        events: ITxEvent[];
      },
    ];
    tx: {
      body: {
        messages: [
          {
            proposer: string;
            initial_deposit?: [
              {
                amount: string;
              },
            ];
            amount: [
              {
                amount: string;
              },
            ];
          },
        ];
      };
    };
  };
}
export interface ITransactions {
  transactions: ITransaction[];
  count: number;
  nextKey: string;
}
