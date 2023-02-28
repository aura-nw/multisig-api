import { Coin } from '@cosmjs/amino';
import { IMsgMultiSend } from '../modules/multisig-transaction/interfaces';

export interface IUnknownValue {
  amount?:
    | Coin[]
    | {
        amount: string;
      };
  inputs?: IMsgMultiSend;
  outputs?: IMsgMultiSend;
  option?: number;
  proposalId?: string;
  fromAddress?: string;
  voter?: string;
}

export interface IMessageUnknown {
  typeUrl: string;
  value: IUnknownValue | Uint8Array;
}