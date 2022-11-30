import {
  createMultisigThresholdPubkey,
  MultisigThresholdPubkey,
  pubkeyToAddress,
} from '@cosmjs/amino';

import { makeMultisignedTx } from '@cosmjs/stargate';

import { OwnerSimulate } from './owner.simulate';
import { toBase64 } from '@cosmjs/encoding';
import { SimulateUtils } from './utils';
import { IndexerClient } from 'src/utils/apis/IndexerClient';

export class SafeSimulate {
  signature: string;
  authInfo: string;
  pubkey: MultisigThresholdPubkey;
  address: string;

  constructor(
    public ownerSimulates: OwnerSimulate[],
    public threshold: number,
    public prefix: string,
    public chainId: string = 'aura-testnet-2',
    public tendermintUrl: string = 'https://rpc.dev.aura.network/',
  ) {
    // create pubkey and address
    this.pubkey = createMultisigThresholdPubkey(
      ownerSimulates.map((owner) => owner.pubkey),
      threshold,
    );
    this.address = pubkeyToAddress(this.pubkey, this.prefix);
  }

  /**
   *  initialize safe
   * @returns
   */
  public async initialize(): Promise<void> {
    // if already initialized, return
    if (this.signature) return;

    // create simple msgs, fee
    const msgs = SimulateUtils.getDefaultMsgs(this.address);
    const fee = SimulateUtils.getDefaultFee();

    // get account number and sequence
    const indexerClient = new IndexerClient();
    const { accountNumber, sequence } =
      await indexerClient.getAccountNumberAndSequence(
        this.chainId,
        this.address,
      );

    // sign with all owners
    const result = await Promise.all(
      this.ownerSimulates.map(async (ownerSimulate) =>
        ownerSimulate.sign(msgs, fee, accountNumber, sequence, this.chainId),
      ),
    );

    // combine signatures
    const bodyBytes = result[0].bodyBytes;
    const signatures = new Map<string, Uint8Array>(
      result.map((r) => {
        return [r.address, r.signature] as const;
      }),
    );

    // create signature and authInfo
    const multisignedTx = makeMultisignedTx(
      this.pubkey,
      sequence,
      fee,
      bodyBytes,
      signatures,
    );

    this.signature = toBase64(multisignedTx.signatures[0]);
    this.authInfo = toBase64(multisignedTx.authInfoBytes);
  }
}
