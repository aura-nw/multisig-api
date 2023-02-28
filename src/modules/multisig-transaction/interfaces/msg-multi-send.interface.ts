export interface IMsgMultiSend {
  address: string;
  coins: [
    {
      amount: string;
      denom: string;
    },
  ];
}
