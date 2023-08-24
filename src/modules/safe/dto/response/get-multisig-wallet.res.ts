import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IAssetsWithType } from '../../../../interfaces/asset-by-owner.interface';

export class GetMultisigWalletResponseDto {
  @Expose()
  @ApiProperty({
    example: 1,
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: 'aura1hj9ugatusgn2fcyrhtryx56tshneqqzlwu6d0k',
  })
  address: string;

  @Expose()
  @ApiProperty({
    example: '95',
  })
  nextQueueSeq: string;

  @Expose()
  @ApiProperty({
    example: '1659946207',
  })
  txHistoryTag: string;

  @Expose()
  @ApiProperty({
    example: '1659946087383',
  })
  txQueuedTag: string;

  @Expose()
  @ApiProperty({
    example:
      '{"type":"tendermint/PubKeyMultisigThreshold","value":{"threshold":"1","pubkeys":[{"type":"tendermint/PubKeySecp256k1","value":"ApIuFLdzGYiCIojuktt+3Y2CwED6TfNmE05wxDHu9vsl"}]}}',
  })
  pubkeys: string;

  @Expose()
  @ApiProperty({
    type: [String],
    example: ['aura1528pnlzdhqhqr835p597f60gjgf6etnutv2eh9'],
  })
  owners: string[];

  @Expose()
  @ApiProperty({
    type: [String],
    example: ['aura1528pnlzdhqhqr835p597f60gjgf6etnutv2eh9'],
  })
  confirms: string[];

  @Expose()
  @ApiProperty({
    example: 1,
  })
  threshold: number;

  @Expose()
  @ApiProperty({
    example: 'created',
  })
  status: string;

  @Expose()
  @ApiProperty({
    example: 1,
  })
  internalChainId: number;

  @Expose()
  assets: IAssetsWithType;

  @Expose()
  @ApiProperty({
    example: 'aura1528pnlzdhqhqr835p597f60gjgf6etnutv2eh9',
  })
  createdAddress: string;
}
