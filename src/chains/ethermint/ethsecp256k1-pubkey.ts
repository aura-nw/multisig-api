import { SinglePubkey } from '@cosmjs/amino';

export interface EthSecp256k1Pubkey extends SinglePubkey {
  readonly type: 'ethermint/PubKeyEthSecp256k1';
  readonly value: string;
}

export function createEthSecp256k1Pubkey(value: string): EthSecp256k1Pubkey {
  const result: EthSecp256k1Pubkey = {
    type: 'ethermint/PubKeyEthSecp256k1',
    value,
  };
  return result;
}
