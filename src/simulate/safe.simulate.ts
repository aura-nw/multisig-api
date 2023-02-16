import {
  coins,
  createMultisigThresholdPubkey,
  MultisigThresholdPubkey,
  pubkeyToAddress,
} from '@cosmjs/amino';

import { makeMultisignedTx } from '@cosmjs/stargate';

import { OwnerSimulate } from './owner.simulate';
import { fromBase64, toBase64 } from '@cosmjs/encoding';
import { SimulateUtils } from './utils';
import { Chain } from '../entities';
import { IndexerClient } from '../utils/apis/indexer-client.service';
import { TX_TYPE_URL } from '../common/constants/app.constant';
import { makeMultisignedTxEvmos } from '../chains/evmos';

export class SafeSimulate {
  signature: string;
  authInfo: string;
  pubkey: MultisigThresholdPubkey;
  address: string;

  constructor(
    public ownerSimulates: OwnerSimulate[],
    public threshold: number,
    public chain: Chain,
  ) {
    // create pubkey and address
    this.pubkey = createMultisigThresholdPubkey(
      ownerSimulates.map((owner) => owner.pubkey),
      threshold,
    );
    this.address = pubkeyToAddress(this.pubkey, this.chain.prefix);
  }

  /**
   *  initialize safe
   * @returns
   */
  public async initialize(): Promise<void> {
    // if already initialized, return
    if (this.signature) return;

    // create simple msgs, fee
    const msgs = SimulateUtils.getDefaultMsgs(this.address, this.chain.denom);
    const fee = SimulateUtils.getDefaultFee(this.chain.denom);

    // get account number and sequence
    const indexerClient = new IndexerClient();
    const { accountNumber, sequence } =
      await indexerClient.getAccountNumberAndSequence(
        this.chain.chainId,
        this.address,
      );

    // sign with all owners
    const result = await Promise.all(
      this.ownerSimulates.map(async (ownerSimulate) =>
        ownerSimulate.sign(
          msgs,
          fee,
          accountNumber,
          sequence,
          this.chain.chainId,
        ),
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
    const multisignedTx = this.chain.chainId.startsWith('evmos')
      ? makeMultisignedTxEvmos(
          this.pubkey,
          sequence,
          fee,
          bodyBytes,
          signatures,
        )
      : makeMultisignedTx(this.pubkey, sequence, fee, bodyBytes, signatures);

    this.signature = toBase64(multisignedTx.signatures[0]);
    this.authInfo = toBase64(multisignedTx.authInfoBytes);
  }

  public async makeSimulateBodyBytesAndAuthInfo(
    messages: any[],
    safeAddress: string,
    safePubkey: any,
    prefix: string,
  ) {
    let simulateAuthInfo;

    // get simulate msgs base typeUrl and the messages given by user
    const encodeMsgs = SimulateUtils.anyToEncodeMsgs(messages, prefix);
    encodeMsgs.forEach((msg) => {
      switch (msg.typeUrl) {
        case TX_TYPE_URL.SEND:
          simulateAuthInfo = this.authInfo;
          msg.value.fromAddress = this.address;
          msg.value.amount = coins(1, msg.value.amount[0].denom);
          break;
        case TX_TYPE_URL.VOTE:
          simulateAuthInfo = this.authInfo;
          msg.value.voter = this.address;
          break;
        default:
          break;
      }
    });

    const authInfoBytes = simulateAuthInfo
      ? fromBase64(simulateAuthInfo)
      : await SimulateUtils.makeAuthInfoBytes(
          this.chain.chainId,
          safeAddress,
          safePubkey,
          this.threshold,
          this.chain.denom,
        );
    const bodyBytes = SimulateUtils.makeBodyBytes(
      encodeMsgs,
      this.chain.prefix,
    );
    return {
      authInfoBytes,
      bodyBytes,
    };
  }
}
