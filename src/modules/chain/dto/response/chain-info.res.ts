import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { TokenInfo } from '../../../../utils/validations';

export class ChainDto {
  @Expose()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    example: 13,
  })
  id: number;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'Aura Testnet',
  })
  name: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'https://rpc-testnet.aura.network',
  })
  rest: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'https://tendermint-testnet.aura.network',
  })
  rpc: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'https://explorer.dev.aura.network',
  })
  explorer: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'aura-testnet',
  })
  chainId: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'TAURA',
  })
  symbol: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'uaura',
  })
  denom: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'aura',
  })
  prefix: string;

  @Expose()
  @IsNumber()
  @ApiProperty({
    example: 6,
  })
  coinDecimals: number;

  @Expose()
  @IsNumber()
  @ApiProperty({
    example: 0.0002,
  })
  gasPrice: number;

  @Expose()
  @IsString()
  @ApiProperty({
    example:
      'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/aura.png',
  })
  tokenImg: string;

  @Expose()
  tokens: TokenInfo[];
}
