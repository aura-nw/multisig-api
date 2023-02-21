import { LegacyAminoPubKey } from 'cosmjs-types/cosmos/crypto/multisig/keys';
import { MultiSignature } from 'cosmjs-types/cosmos/crypto/multisig/v1beta1/multisig';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { Any } from 'cosmjs-types/google/protobuf/any';
import { PubKey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys';
import { AuthInfo, SignerInfo, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Uint53 } from '@cosmjs/math';
import {
  isEd25519Pubkey,
  isMultisigThresholdPubkey,
  isSecp256k1Pubkey,
  MultisigThresholdPubkey,
  Pubkey,
  serializeSignDoc,
  SinglePubkey,
  StdFee,
  StdSignDoc,
} from '@cosmjs/amino';
import {
  keccak256,
  Keccak256,
  Secp256k1,
  Secp256k1Signature,
} from '@cosmjs/crypto';
import {
  fromBase64,
  fromBech32,
  fromHex,
  toAscii,
  toBech32,
  toHex,
} from '@cosmjs/encoding';
import { makeCompactBitArray } from '@cosmjs/stargate/build/multisignature';
import * as Long from 'long';
import { ethToEvmos } from '@evmos/address-converter';
import * as ethUtils from 'ethereumjs-util';

// As discussed in https://github.com/binance-chain/javascript-sdk/issues/163
// Prefixes listed here: https://github.com/tendermint/tendermint/blob/d419fffe18531317c28c29a292ad7d253f6cafdf/docs/spec/blockchain/encoding.md#public-key-cryptography
// Last bytes is varint-encoded length prefix
const pubkeyAminoPrefixEthSecp256k1 = fromHex('21' /* fixed length */);
const pubkeyAminoPrefixSecp256k1 = fromHex(`eb5ae987${21}` /* fixed length */);
const pubkeyAminoPrefixEd25519 = fromHex(`1624de64${20}` /* fixed length */);
/** See https://github.com/tendermint/tendermint/commit/38b401657e4ad7a7eeb3c30a3cbf512037df3740 */
const pubkeyAminoPrefixMultisigThreshold = fromHex(
  '22c1f7e2' /* variable length not included */,
);

export interface EthSecp256k1Pubkey extends SinglePubkey {
  readonly type: 'ethermint/PubKeyEthSecp256k1';
  readonly value: string;
}

export async function verifyEvmosSig(
  signature: string,
  msg: StdSignDoc,
  expectEvmosAddr: string,
) {
  const sig = Secp256k1Signature.fromFixedLength(fromBase64(signature));
  let valid = false;
  for (let i = 0; i < 2; i += 1) {
    const pub = ethUtils.ecrecover(
      ethUtils.toBuffer(keccak256(serializeSignDoc(msg))),
      27 + i,
      Buffer.from(sig.r()),
      Buffer.from(sig.s()),
    );
    const addrBuf = ethUtils.pubToAddress(pub);
    const addr = ethUtils.bufferToHex(addrBuf);
    const evmosAddr = ethToEvmos(addr);

    if (evmosAddr === expectEvmosAddr) {
      valid = true;
    }
  }
  return valid;
}

export function pubkeyToRawAddress(pubkey: Pubkey): Uint8Array {
  const pubKeyDecoded = Buffer.from(pubkey.value, 'base64');
  const pubKeyUncompressed = Secp256k1.uncompressPubkey(pubKeyDecoded);
  const hash = new Keccak256(pubKeyUncompressed.slice(1)).digest();
  const lastTwentyBytes = hash.slice(-20);
  return lastTwentyBytes;
}

export function pubkeyToAddressEvmos(pubkey: string, prefix = 'evmos'): string {
  const ethermintPubkey = createEvmosPubkey(pubkey);
  const rawAddress = pubkeyToRawAddress(ethermintPubkey);

  // generate eth address
  const ethAddress = toChecksummedAddress(rawAddress);
  console.log(`ETH address: ${ethAddress}`);

  // generate bech32 address
  const bech32Address = toBech32(prefix, rawAddress);

  return bech32Address;
}

/**
 * Encodes a public key to binary Amino.
 */
export function encodeAminoPubkeySupportEvmos(pubkey: Pubkey): Uint8Array {
  if (isMultisigThresholdPubkey(pubkey)) {
    const out = [...pubkeyAminoPrefixMultisigThreshold];
    out.push(0x08);
    out.push(...encodeUvarint(pubkey.value.threshold));
    for (const pubkeyData of pubkey.value.pubkeys.map((p) =>
      encodeAminoPubkeySupportEvmos(p),
    )) {
      out.push(0x12);
      out.push(...encodeUvarint(pubkeyData.length), ...pubkeyData);
    }
    return new Uint8Array(out);
  }
  if (isEd25519Pubkey(pubkey)) {
    return new Uint8Array([
      ...pubkeyAminoPrefixEd25519,
      ...fromBase64(pubkey.value),
    ]);
  }
  if (isSecp256k1Pubkey(pubkey)) {
    return new Uint8Array([
      ...pubkeyAminoPrefixSecp256k1,
      ...fromBase64(pubkey.value),
    ]);
  }
  if (isEthSecp256k1Pubkey(pubkey)) {
    return new Uint8Array([
      ...pubkeyAminoPrefixEthSecp256k1,
      ...fromBase64(pubkey.value),
    ]);
  }
  throw new Error('Unsupported pubkey type');
}

export function createMultisigThresholdPubkeyEvmos(
  pubkeys: readonly SinglePubkey[],
  threshold: number,
  nosort = false,
): MultisigThresholdPubkey {
  const uintThreshold = new Uint53(threshold);
  if (uintThreshold.toNumber() > pubkeys.length) {
    throw new Error(
      `Threshold k = ${uintThreshold.toNumber()} exceeds number of keys n = ${
        pubkeys.length
      }`,
    );
  }

  const outPubkeys = nosort
    ? pubkeys
    : [...pubkeys].sort((lhs, rhs) => {
        // https://github.com/cosmos/cosmos-sdk/blob/v0.42.2/client/keys/add.go#L172-L174
        const addressLhs = pubkeyToRawAddress(lhs);
        const addressRhs = pubkeyToRawAddress(rhs);
        return compareArrays(addressLhs, addressRhs);
      });
  return {
    type: 'tendermint/PubKeyMultisigThreshold',
    value: {
      threshold: uintThreshold.toString(),
      pubkeys: outPubkeys,
    },
  };
}

export function makeMultisignedTxEvmos(
  multisigPubkey: MultisigThresholdPubkey,
  sequence: number,
  fee: StdFee,
  bodyBytes: Uint8Array,
  signatures: Map<string, Uint8Array>,
): TxRaw {
  const addresses = [...signatures.keys()];
  const { prefix } = fromBech32(addresses[0]);

  const signers: boolean[] = Array.from({length: multisigPubkey.value.pubkeys.length}).fill(
    false,
  );
  const signaturesList = new Array<Uint8Array>();
  for (let i = 0; i < multisigPubkey.value.pubkeys.length; i += 1) {
    const signerAddress = pubkeyToAddressEvmos(
      multisigPubkey.value.pubkeys[i].value,
      prefix,
    );
    const signature = signatures.get(signerAddress);
    if (signature) {
      signers[i] = true;
      signaturesList.push(signature);
    }
  }

  const signerInfo: SignerInfo = {
    publicKey: encodePubkeyEvmos(multisigPubkey),
    modeInfo: {
      multi: {
        bitarray: makeCompactBitArray(signers),
        modeInfos: signaturesList.map(() => ({
          single: { mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON },
        })),
      },
    },
    sequence: Long.fromNumber(sequence),
  };

  const authInfo = AuthInfo.fromPartial({
    signerInfos: [signerInfo],
    fee: {
      amount: [...fee.amount],
      gasLimit: Long.fromString(fee.gas),
    },
  });

  const authInfoBytes = AuthInfo.encode(authInfo).finish();
  const signedTx = TxRaw.fromPartial({
    bodyBytes,
    authInfoBytes,
    signatures: [
      MultiSignature.encode(
        MultiSignature.fromPartial({ signatures: signaturesList }),
      ).finish(),
    ],
  });
  return signedTx;
}

export function encodePubkeyEvmos(pubkey: Pubkey): Any {
  if (isSecp256k1Pubkey(pubkey)) {
    const pubkeyProto = PubKey.fromPartial({
      key: fromBase64(pubkey.value),
    });
    return Any.fromPartial({
      typeUrl: '/cosmos.crypto.secp256k1.PubKey',
      value: Uint8Array.from(PubKey.encode(pubkeyProto).finish()),
    });
  }
  if (isEthSecp256k1Pubkey(pubkey)) {
    const pubkeyProto = PubKey.fromPartial({
      key: fromBase64(pubkey.value),
    });
    return Any.fromPartial({
      typeUrl: '/ethermint.crypto.v1.ethsecp256k1.PubKey',
      value: Uint8Array.from(PubKey.encode(pubkeyProto).finish()),
    });
  }
  if (isMultisigThresholdPubkey(pubkey)) {
    const pubkeyProto = LegacyAminoPubKey.fromPartial({
      threshold: Uint53.fromString(pubkey.value.threshold).toNumber(),
      publicKeys: pubkey.value.pubkeys.map(encodePubkeyEvmos),
    });
    return Any.fromPartial({
      typeUrl: '/cosmos.crypto.multisig.LegacyAminoPubKey',
      value: Uint8Array.from(LegacyAminoPubKey.encode(pubkeyProto).finish()),
    });
  }
  throw new Error(`Pubkey type ${pubkey.type} not recognized`);
}

function encodeUvarint(value: number | string): number[] {
  const checked = Uint53.fromString(value.toString()).toNumber();
  if (checked > 127) {
    throw new Error(
      'Encoding numbers > 127 is not supported here. Please tell those lazy CosmJS maintainers to port the binary.PutUvarint implementation from the Go standard library and write some tests.',
    );
  }
  return [checked];
}

function isEthSecp256k1Pubkey(pubkey: Pubkey): pubkey is EthSecp256k1Pubkey {
  return (pubkey as EthSecp256k1Pubkey).type === 'ethermint/PubKeyEthSecp256k1';
}

export function createEvmosPubkey(value: string): SinglePubkey {
  const result: SinglePubkey = {
    type: 'ethermint/PubKeyEthSecp256k1',
    value,
  };
  return result;
}

function isValidAddress(address: string): boolean {
  if (!/^0x[\dA-Fa-f]{40}$/.test(address)) {
    return false;
  }
  return true;
}

function toChecksummedAddress(address: string | Uint8Array): string {
  // 40 low hex characters
  let addressLower;
  if (typeof address === 'string') {
    if (!isValidAddress(address)) {
      throw new Error('Input is not a valid Ethereum address');
    }
    addressLower = address.toLowerCase().replace('0x', '');
  } else {
    if (address.length !== 20) {
      throw new Error('Invalid Ethereum address length. Must be 20 bytes.');
    }
    addressLower = toHex(address);
  }

  const addressHash = toHex(new Keccak256(toAscii(addressLower)).digest());
  let checksumAddress = '0x';
  for (let i = 0; i < 40; i += 1) {
    checksumAddress +=
      Number.parseInt(addressHash[i], 16) > 7
        ? addressLower[i].toUpperCase()
        : addressLower[i];
  }
  return checksumAddress;
}

function compareArrays(a: Uint8Array, b: Uint8Array): number {
  const aHex = toHex(a);
  const bHex = toHex(b);
  if (aHex === bHex) return 0;
  return aHex < bHex ? -1 : 1;
}
