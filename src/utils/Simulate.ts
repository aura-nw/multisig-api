import {
  CompactBitArray,
  MultiSignature,
} from 'cosmjs-types/cosmos/crypto/multisig/v1beta1/multisig';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import {
  AccountData,
  coin,
  coins,
  createMultisigThresholdPubkey,
  encodeSecp256k1Pubkey,
  makeCosmoshubPath,
  MultisigThresholdPubkey,
  pubkeyToAddress,
  Secp256k1HdWallet,
  Secp256k1Pubkey,
  makeSignDoc as makeSignDocAmino,
} from '@cosmjs/amino';
import {
  AminoTypes,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createGovAminoConverters,
  createStakingAminoConverters,
  makeMultisignedTx,
  MsgSendEncodeObject,
  SignerData,
  SigningStargateClient,
  StargateClient,
} from '@cosmjs/stargate';
import { fromBase64, fromBech32, toBase64 } from '@cosmjs/encoding';
import { Registry, TxBodyEncodeObject } from '@cosmjs/proto-signing';
import { REGISTRY_GENERATED_TYPES } from 'src/common/constants/app.constant';
import { CommonUtil } from './common.util';

class OwnerSimulate {
  address: string;
  pubkey: Secp256k1Pubkey;

  constructor(
    public wallet: Secp256k1HdWallet,
    public account: AccountData,
    public prefix: string,
  ) {
    this.pubkey = encodeSecp256k1Pubkey(account.pubkey);
    this.address = pubkeyToAddress(this.pubkey, this.prefix);
  }
}

class SafeSimulate {
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
    this.pubkey = createMultisigThresholdPubkey(
      ownerSimulates.map((owner) => owner.pubkey),
      threshold,
    );
    this.address = pubkeyToAddress(this.pubkey, this.prefix);
  }

  public async initSignature() {
    if (this.signature) return;
    // create simple msgs, fee
    const msgSend: MsgSend = {
      fromAddress: this.address,
      toAddress: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
      amount: coins(1, 'utaura'),
    };
    const msg: MsgSendEncodeObject = {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: msgSend,
    };

    const msgs = [msg];

    const gasLimit = 200000;
    const fee = {
      amount: coins(1, 'utaura'),
      gas: gasLimit.toString(),
    };

    const client = await StargateClient.connect(this.tendermintUrl);
    const { accountNumber, sequence } = await client.getAccount(this.address);

    // sign with all owners
    const result = await Promise.all(
      this.ownerSimulates.map(async (ownerSimulate) => {
        const signingClient = await SigningStargateClient.offline(
          ownerSimulate.wallet,
        );
        const signerData: SignerData = {
          accountNumber: accountNumber,
          sequence: sequence,
          chainId: this.chainId,
        };
        const { bodyBytes: bb, signatures } = await signingClient.sign(
          ownerSimulate.address,
          msgs,
          fee,
          '',
          signerData,
        );

        console.log('wallet sign: ', toBase64(signatures[0]));
        return [ownerSimulate.address, signatures[0], bb] as const;
      }),
    );

    // combine signatures
    const bodyBytes = result[0][2];

    // console.log(toBase64(bodyBytes));
    const signatures = new Map<string, Uint8Array>(
      result.map((r) => {
        return [r[0], r[1]] as const;
      }),
    );

    const multisignedTx = makeMultisignedTx(
      this.pubkey,
      sequence,
      fee,
      bodyBytes,
      signatures,
    );
    // console.log(toBase64(multisignedTx.signatures[0]));
    // const newTx = TxRaw.fromPartial({
    //   bodyBytes: multisignedTx.bodyBytes,
    //   authInfoBytes: multisignedTx.authInfoBytes,
    //   signatures: [
    //     fromBase64(
    //       'CkAEan4bRaL7+7Ns0PlCb7ZbHLkYU6C1iPWybbkKbs0nblGGhH1FZQevJhkXwblgMHwhDf8TBvcEQEyDguXVgZlrCkC+Af3B4tPRFfEf6qIe1MpsFcJktxI3U28pOkFtNy1oNQLIkpRq4ntPCp5269xJ4EcR+UBA5PF07+MH7MSFRgWY',
    //     ),
    //   ],
    // });

    // const multisignedTxBytes = Uint8Array.from(TxRaw.encode(newTx).finish());
    // set signatures
    // this.signature = toBase64(multisignedTxBytes);

    this.signature = toBase64(multisignedTx.signatures[0]);
    this.authInfo = toBase64(multisignedTx.authInfoBytes);
  }

  // private makeMultisignedSignature(
  //   multisigPubkey: MultisigThresholdPubkey,
  //   signatures: Map<string, Uint8Array>,
  // ): string {
  //   const addresses = Array.from(signatures.keys());
  //   const prefix = fromBech32(addresses[0]).prefix;

  //   const signers: boolean[] = Array(multisigPubkey.value.pubkeys.length).fill(
  //     false,
  //   );
  //   const signaturesList = new Array<Uint8Array>();
  //   for (let i = 0; i < multisigPubkey.value.pubkeys.length; i++) {
  //     const signerAddress = pubkeyToAddress(
  //       multisigPubkey.value.pubkeys[i],
  //       prefix,
  //     );
  //     const signature = signatures.get(signerAddress);
  //     if (signature) {
  //       signers[i] = true;
  //       signaturesList.push(signature);
  //     }
  //   }
  //   const multiSignatureEncoded = MultiSignature.encode(
  //     MultiSignature.fromPartial({ signatures: signaturesList }),
  //   ).finish();
  //   return toBase64(multiSignatureEncoded);
  // }
}

export class Simulate {
  safeOwnerMap = new Map<number, SafeSimulate>();
  ownerWallets: OwnerSimulate[] = [];

  constructor(mnemonic: string, public prefix: string) {
    this.initialize(mnemonic);
  }

  async initialize(mnemonic: string) {
    // generate owners
    for (let i = 0; i < 20; i += 1) {
      const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
        hdPaths: [makeCosmoshubPath(i)],
        prefix: this.prefix,
      });
      const accounts = await wallet.getAccounts();
      const ownerWallet = new OwnerSimulate(wallet, accounts[0], this.prefix);
      this.ownerWallets.push(ownerWallet);
    }

    // create safe with owner from 1 -> 20
    for (let i = 1; i <= 20; i += 1) {
      const safe = new SafeSimulate(
        this.ownerWallets.slice(0, i),
        i,
        this.prefix,
      );

      this.safeOwnerMap.set(i, safe);
    }
  }

  async simulate(messages: any[], totalOwner: number) {
    const safe = this.safeOwnerMap.get(totalOwner);
    if (!safe) {
      throw new Error('safe not found');
    }

    // get system auth info, signature
    await safe.initSignature();

    // build bodyByte

    const aminoTypes = new AminoTypes({
      ...createBankAminoConverters(),
      ...createStakingAminoConverters('aura'),
      ...createDistributionAminoConverters(),
      ...createGovAminoConverters(),
    });

    const msgs = messages.map((msg) => aminoTypes.toAmino(msg));
    // const signDoc = makeSignDocAmino(
    //   msgs,
    //   fee,
    //   chainId,
    //   '',
    //   accountNumber,
    //   sequence,
    // );

    const signedTxBody = {
      messages: msgs.map((msg) => aminoTypes.fromAmino(msg)),
      memo: '',
    };
    const signedTxBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: signedTxBody,
    };
    // const signedTxBodyEncodeObject: TxBodyEncodeObject = {
    //   typeUrl: '/cosmos.tx.v1beta1.TxBody',
    //   value: messages,
    // };
    const registry = new Registry(REGISTRY_GENERATED_TYPES);
    const bodyBytes = registry.encode(signedTxBodyEncodeObject);

    // build txRaw
    const newTxRaw = TxRaw.fromPartial({
      bodyBytes: bodyBytes,
      authInfoBytes: fromBase64(safe.authInfo),
      signatures: [fromBase64(safe.signature)],
    });
    const multisignedTxBytes = Uint8Array.from(TxRaw.encode(newTxRaw).finish());
    const txBytesEncoded = toBase64(multisignedTxBytes);

    // call simulate api
    const lcdUrl = 'https://lcd.dev.aura.network/';
    const url = new URL(`cosmos/tx/v1beta1/simulate`, lcdUrl);
    const _commonUtil = new CommonUtil();
    const simulateRes = await _commonUtil.request(url.href, 'POST', {
      tx_bytes: txBytesEncoded,
    });
    console.log(simulateRes.gas_info);
  }

  getAddresses(): string[] {
    return Array.from(this.safeOwnerMap.values()).map((safe) => safe.address);
  }

  getAllOwnerAddresses(): string[] {
    return this.ownerWallets.map((owner) => owner.address);
  }
}
