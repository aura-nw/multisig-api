export interface ISafePubkey {
  type: string;
  value: {
    threshold: string;
    pubkeys: [
      {
        type: string;
        value: string;
      },
    ];
  };
}
