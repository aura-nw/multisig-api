import {
  coins,
  createMultisigThresholdPubkey,
  MultisigThresholdPubkey,
  pubkeyToAddress,
} from '@cosmjs/amino';

import { makeMultisignedTx } from '@cosmjs/stargate';

import { fromBase64, toBase64, toUtf8 } from '@cosmjs/encoding';
import { Injectable } from '@nestjs/common';
import { OwnerSimulate } from './owner.simulate';
import { SimulateUtils } from './utils';
import { Chain } from '../chain/entities/chain.entity';
import { IEncodedObjectMsg, ISafePubkey } from './interfaces';
import { IMessageUnknown } from '../../interfaces';
import { EthermintHelper } from '../../chains/ethermint/ethermint.helper';
import { TxTypeUrl } from '../../common/constants/app.constant';
import { ChainInfo } from '../../utils/validations';

@Injectable()
export class SafeSimulate {
  private ethermintHelper = new EthermintHelper();

  signature: string;

  authInfo: string;

  pubkey: MultisigThresholdPubkey;

  address: string;

  accountNumber: number;

  sequence: number;

  public ownerSimulates: OwnerSimulate[];

  public threshold: number;

  public chain: Chain | ChainInfo;

  setAccountInfo(accountNumber: number, sequence: number) {
    this.accountNumber = accountNumber;
    this.sequence = sequence;
  }

  setOwners(
    ownerSimulates: OwnerSimulate[],
    threshold: number,
    chain: Chain | ChainInfo,
  ) {
    // create pubkey and address
    this.pubkey = createMultisigThresholdPubkey(
      ownerSimulates.map((owner) => owner.pubkey),
      threshold,
    );
    this.ownerSimulates = ownerSimulates;
    this.chain = chain;
    this.address = pubkeyToAddress(this.pubkey, this.chain.prefix);
  }

  /**
   *  initialize safe
   */
  public async initialize(): Promise<void> {
    // if already initialized, return
    if (this.signature) return;

    // create simple msgs, fee
    const msgs = SimulateUtils.getDefaultMsgs(this.address, this.chain.denom);
    const fee = SimulateUtils.getDefaultFee(this.chain.denom);

    // sign with all owners
    const result = await Promise.all(
      this.ownerSimulates.map(async (ownerSimulate) =>
        ownerSimulate.sign(
          msgs,
          fee,
          this.accountNumber,
          this.sequence,
          this.chain.chainId,
        ),
      ),
    );

    // combine signatures
    const { bodyBytes } = result[0];
    const signatures = new Map<string, Uint8Array>(
      result.map((r) => [r.address, r.signature] as const),
    );

    // create signature and authInfo
    const multisignedTx =
      this.chain.coinDecimals === 18
        ? this.ethermintHelper.makeMultisignedTxEthermint(
            this.pubkey,
            this.sequence,
            fee,
            bodyBytes,
            signatures,
          )
        : makeMultisignedTx(
            this.pubkey,
            this.sequence,
            fee,
            bodyBytes,
            signatures,
          );

    this.signature = toBase64(multisignedTx.signatures[0]);
    this.authInfo = toBase64(multisignedTx.authInfoBytes);
  }

  public makeSimulateBodyBytesAndAuthInfo(
    messages: IMessageUnknown[],
    sequence: number,
    safePubkey: ISafePubkey,
  ) {
    let simulateAuthInfo: string;
    // get simulate msgs base typeUrl and the messages given by user
    const encodeMsgs = SimulateUtils.anyToEncodeMsgs(messages);

    const updatedEncodeMsgs = encodeMsgs.map((msg) => {
      const updatedMsg = msg as IEncodedObjectMsg;
      switch (msg.typeUrl) {
        case TxTypeUrl.SEND: {
          simulateAuthInfo = this.authInfo;
          updatedMsg.value.fromAddress = this.address;
          updatedMsg.value.amount = coins(1, updatedMsg.value.amount[0].denom);
          break;
        }
        case TxTypeUrl.VOTE: {
          simulateAuthInfo = this.authInfo;
          updatedMsg.value.voter = this.address;
          break;
        }
        case TxTypeUrl.EXECUTE_CONTRACT: {
          updatedMsg.value.msg =
            typeof updatedMsg.value.msg === 'string'
              ? toUtf8(updatedMsg.value.msg)
              : updatedMsg.value.msg;
          break;
        }
        default: {
          break;
        }
      }
      return updatedMsg;
    });

    const authInfoBytes = simulateAuthInfo
      ? fromBase64(simulateAuthInfo)
      : SimulateUtils.makeAuthInfoBytes(
          this.chain.chainId,
          sequence,
          safePubkey,
          this.threshold,
          this.chain.denom,
        );
    const bodyBytes = SimulateUtils.makeBodyBytes(updatedEncodeMsgs);
    return {
      authInfoBytes,
      bodyBytes,
    };
  }
}
