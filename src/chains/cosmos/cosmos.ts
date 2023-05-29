import {
  encodeSecp256k1Pubkey,
  pubkeyToAddress,
  serializeSignDoc,
  StdSignDoc,
} from '@cosmjs/amino';
import { Secp256k1, Secp256k1Signature, sha256 } from '@cosmjs/crypto';
import { fromBase64 } from '@cosmjs/encoding';

export class CosmosUtil {
  async verifyCosmosSig(
    signature: string,
    msg: StdSignDoc,
    pubkey: Uint8Array,
  ) {
    const resultVerify = await Secp256k1.verifySignature(
      Secp256k1Signature.fromFixedLength(fromBase64(signature)),
      sha256(serializeSignDoc(msg)),
      pubkey,
    );
    if (!resultVerify) {
      return false;
    }
    return true;
  }

  pubkeyToAddress(pubkey: string, prefix: string) {
    const pubkeyFormated = encodeSecp256k1Pubkey(fromBase64(pubkey));
    return pubkeyToAddress(pubkeyFormated, prefix);
  }
}
