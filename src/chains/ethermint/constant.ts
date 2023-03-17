import { fromHex } from '@cosmjs/encoding';

// As discussed in https://github.com/binance-chain/javascript-sdk/issues/163
// Prefixes listed here: https://github.com/tendermint/tendermint/blob/d419fffe18531317c28c29a292ad7d253f6cafdf/docs/spec/blockchain/encoding.md#public-key-cryptography

// Last bytes is varint-encoded length prefix
const scep256k1FixedLength = '21';
const ed25519FixedLength = '21';

export const pubkeyAminoPrefixEthSecp256k1 = fromHex('21' /* fixed length */);

export const pubkeyAminoPrefixSecp256k1 = fromHex(
  `eb5ae987${scep256k1FixedLength}` /* fixed length */,
);
export const pubkeyAminoPrefixEd25519 = fromHex(
  `1624de64${ed25519FixedLength}` /* fixed length */,
);
/** See https://github.com/tendermint/tendermint/commit/38b401657e4ad7a7eeb3c30a3cbf512037df3740 */
export const pubkeyAminoPrefixMultisigThreshold = fromHex(
  '22c1f7e2' /* variable length not included */,
);
