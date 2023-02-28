import { AuthInfo, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import {
  EncodeObject,
  encodePubkey,
  Registry,
  TxBodyEncodeObject,
} from '@cosmjs/proto-signing';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { makeCompactBitArray } from '@cosmjs/stargate/build/multisignature';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import {
  AminoTypes,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createGovAminoConverters,
  createStakingAminoConverters,
  MsgSendEncodeObject,
  StdFee,
} from '@cosmjs/stargate';
import { coins } from '@cosmjs/amino';
import { RegistryGeneratedTypes } from '../../common/constants/app.constant';
import { encodePubkeyEvmos } from '../../chains/evmos';
import { ISafePubkey } from './interfaces';
import { IMessageUnknown } from '../../interfaces';

export class SimulateUtils {
  public static makeBodyBytes(
    messages: IMessageUnknown[],
    prefix: string,
  ): Uint8Array {
    const signedTxBody = {
      messages: this.anyToEncodeMsgs(messages, prefix),
      memo: '',
    };
    const signedTxBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: signedTxBody,
    };
    const registry = new Registry(RegistryGeneratedTypes);
    return registry.encode(signedTxBodyEncodeObject);
  }

  static makeAuthInfoBytes(
    chainId: string,
    sequence: number,
    safePubkey: ISafePubkey,
    totalOwner: number,
    denom: string,
  ): Uint8Array {
    const defaultFee = SimulateUtils.getDefaultFee(denom);
    const signers: boolean[] = Array.from({ length: totalOwner }).map(Boolean);

    const encodedPubkey = chainId.startsWith('evmos')
      ? encodePubkeyEvmos(safePubkey)
      : encodePubkey(safePubkey);

    const authInfo = AuthInfo.fromPartial({
      signerInfos: [
        {
          publicKey: encodedPubkey,
          modeInfo: {
            multi: {
              bitarray: makeCompactBitArray(signers),
              modeInfos: safePubkey.value.pubkeys.map(() => ({
                single: { mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON },
              })),
            },
          },
          sequence,
        },
      ],
      fee: {
        amount: [...defaultFee.amount],
        gasLimit: defaultFee.gas,
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
      bodyBytes,
      authInfoBytes,
      signatures: [signature],
    });
    return Uint8Array.from(TxRaw.encode(newTxRaw).finish());
  }

  public static getDefaultMsgs(
    safeAddress: string,
    denom: string,
  ): MsgSendEncodeObject[] {
    const msgSend: MsgSend = {
      fromAddress: safeAddress,
      toAddress: safeAddress,
      amount: coins(1, denom),
    };
    const msg: MsgSendEncodeObject = {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: msgSend,
    };
    return [msg];
  }

  static getDefaultFee(denom: string): StdFee {
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
  static anyToEncodeMsgs(
    messages: IMessageUnknown[],
    prefix: string,
  ): EncodeObject[] {
    const aminoTypes = new AminoTypes({
      ...createBankAminoConverters(),
      ...createStakingAminoConverters(prefix),
      ...createDistributionAminoConverters(),
      ...createGovAminoConverters(),
    });
    const msgs = messages.map((msg) => aminoTypes.toAmino(msg));
    return msgs.map((msg) => aminoTypes.fromAmino(msg));
  }
}
