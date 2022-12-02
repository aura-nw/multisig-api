import * as Long from 'long';
import { AuthInfo, SignerInfo } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { EncodeObject, encodePubkey } from '@cosmjs/proto-signing';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { makeCompactBitArray } from '@cosmjs/stargate/build/multisignature';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Registry, TxBodyEncodeObject } from '@cosmjs/proto-signing';
import {
  AminoTypes,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createGovAminoConverters,
  createStakingAminoConverters,
  MsgSendEncodeObject,
  StdFee,
} from '@cosmjs/stargate';
import { REGISTRY_GENERATED_TYPES } from 'src/common/constants/app.constant';
import { coins } from '@cosmjs/amino';
import { IndexerClient } from 'src/utils/apis/IndexerClient';

export class SimulateUtils {
  public static makeBodyBytes(messages: any[]): Uint8Array {
    const signedTxBody = {
      messages: this.anyToEncodeMsgs(messages),
      memo: '',
    };
    const signedTxBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: signedTxBody,
    };
    const registry = new Registry(REGISTRY_GENERATED_TYPES);
    return registry.encode(signedTxBodyEncodeObject);
  }

  static async makeAuthInfoBytes(
    chainId: string,
    safeAddress: string,
    safePubkey: any,
    totalOwner: number,
  ): Promise<Uint8Array> {
    const indexerClient = new IndexerClient();
    let sequence = 0;
    try {
      sequence = (
        await indexerClient.getAccountNumberAndSequence(chainId, safeAddress)
      ).sequence;
    } catch (error) {
      console.log(error);
    }

    const defaultFee = SimulateUtils.getDefaultFee();
    const signers: boolean[] = Array(totalOwner).fill(false);

    const signerInfo: SignerInfo = {
      publicKey: encodePubkey(safePubkey),
      modeInfo: {
        multi: {
          bitarray: makeCompactBitArray(signers),
          modeInfos: safePubkey.value.pubkeys.map(() => ({
            single: { mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON },
          })),
        },
      },
      sequence: Long.fromNumber(sequence),
    };

    const authInfo = AuthInfo.fromPartial({
      signerInfos: [signerInfo],
      fee: {
        amount: [...defaultFee.amount],
        gasLimit: Long.fromString(defaultFee.gas),
      },
    });
    return AuthInfo.encode(authInfo).finish();
  }

  public static makeTxBytes(
    bodyBytes: Uint8Array,
    authInfoBytes: Uint8Array,
    signature: Uint8Array,
  ): Uint8Array {
    const newTxRaw = TxRaw.fromPartial({
      bodyBytes: bodyBytes,
      authInfoBytes: authInfoBytes,
      signatures: [signature],
    });
    return Uint8Array.from(TxRaw.encode(newTxRaw).finish());
  }

  public static getDefaultMsgs(safeAddress: string): MsgSendEncodeObject[] {
    const msgSend: MsgSend = {
      fromAddress: safeAddress,
      toAddress: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
      amount: coins(1, 'utaura'),
    };
    const msg: MsgSendEncodeObject = {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: msgSend,
    };
    return [msg];
  }

  static getDefaultFee(denom = 'utaura'): StdFee {
    return {
      amount: coins(1, denom),
      gas: '200000',
    };
  }

  /**
   * 
   * @param messages 
   * @returns 
    [
      {
        typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
        value: {
          delegatorAddress: "aura1p60cjssaceu0q8f8t99e809gh2nxrq9rmp5kam",
          validatorAddress: "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh",
          amount: {
            amount: "1",
            denom: "utaura",
          },
        },
      },
    ]
   */
  static anyToEncodeMsgs(messages: any[]): EncodeObject[] {
    const aminoTypes = new AminoTypes({
      ...createBankAminoConverters(),
      ...createStakingAminoConverters('aura'),
      ...createDistributionAminoConverters(),
      ...createGovAminoConverters(),
    });
    const msgs = messages.map((msg) => aminoTypes.toAmino(msg));
    return msgs.map((msg) => aminoTypes.fromAmino(msg));
  }
}
