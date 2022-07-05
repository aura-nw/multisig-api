import { ApiProperty } from '@nestjs/swagger';

export class CreateSafeResponse {
  @ApiProperty({
    example: 1,
  })
  id: number;

  @ApiProperty({ example: 'aura1mkkuvgwj4efuzy6rxa8n74yjttjaw7udt6hj9u' })
  safeAddress: string;

  @ApiProperty({
    example:
      '{ "type": "tendermint/PubKeyMultisigThreshold", "value": { "threshold": "0", "pubkeys": [{ "type": "tendermint/PubKeySecp256k1", "value": "ApIuFLdzGYiCIojuktt+3Y2CwED6TfNmE05wxDHu9vsl" }] } } ',
  })
  safePubkey: string;

  @ApiProperty({ example: 'aura1528pnlzdhqhqr835p597f60gjgf6etnutv2eh9' })
  creatorAddress: string;

  @ApiProperty({ example: 'ApIuFLdzGYiCIojuktt+3Y2CwED6TfNmE05wxDHu9vsl' })
  creatorPubkey: string;

  @ApiProperty({ example: '1' })
  threshold: number;

  @ApiProperty({ example: 'created' })
  status: string;

  @ApiProperty({ example: '2LNaLuaUbK++GNQbDOeCzWOyZSItKHsld1n/K3F1wNw=' })
  addressHash: string;

  @ApiProperty({ example: 'InternalChainId' })
  internalChainId: 1;
}
