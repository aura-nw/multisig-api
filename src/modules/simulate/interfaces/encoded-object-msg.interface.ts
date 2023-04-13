import { Coin } from '@cosmjs/amino';
import { IMsgMultiSend } from '../../multisig-transaction/interfaces';

export interface IEncodedObjectMsg {
  typeUrl: string;
  value: {
    fromAddress?: string;
    amount?: Coin[];
    voter?: string;
    inputs?: IMsgMultiSend;
    outputs?: IMsgMultiSend;
    option?: number;
    proposalId?: string;
    sender?: string;
    contract?: string;
    msg?: Uint8Array | string;
    funds?: Coin[];
  };
}
