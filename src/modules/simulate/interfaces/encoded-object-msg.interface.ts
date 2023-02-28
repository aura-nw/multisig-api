import { Coin } from '@cosmjs/amino';

export interface IEncodedObjectMsg {
  typeUrl: string;
  value: {
    fromAddress?: string;
    amount?: Coin[];
    voter?: string;
  };
}
