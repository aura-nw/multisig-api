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

export class SimulateUtils {
  public static makeBodyBytes(messages: any[]): Uint8Array {
    const aminoTypes = new AminoTypes({
      ...createBankAminoConverters(),
      ...createStakingAminoConverters('aura'),
      ...createDistributionAminoConverters(),
      ...createGovAminoConverters(),
    });

    const msgs = messages.map((msg) => aminoTypes.toAmino(msg));

    const signedTxBody = {
      messages: msgs.map((msg) => aminoTypes.fromAmino(msg)),
      memo: '',
    };
    const signedTxBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: signedTxBody,
    };
    const registry = new Registry(REGISTRY_GENERATED_TYPES);
    return registry.encode(signedTxBodyEncodeObject);
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
}
