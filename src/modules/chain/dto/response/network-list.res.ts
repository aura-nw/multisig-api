import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { FindGasByChainDto } from '../../../gas/dtos';

export class NetworkListResponseDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    example: 13,
  })
  id: number;

  @IsString()
  @ApiProperty({
    example: 'Aura Testnet',
  })
  name: string;

  @IsString()
  @ApiProperty({
    example: 'https://rpc-testnet.aura.network',
  })
  rest: string;

  @IsString()
  @ApiProperty({
    example: 'https://tendermint-testnet.aura.network',
  })
  rpc: string;

  @IsString()
  @ApiProperty({
    example: 'https://explorer.dev.aura.network',
  })
  explorer: string;

  @IsString()
  @ApiProperty({
    example: 'aura-testnet',
  })
  chainId: string;

  @IsString()
  @ApiProperty({
    example: 'TAURA',
  })
  symbol: string;

  @IsString()
  @ApiProperty({
    example: 'uaura',
  })
  denom: string;

  @IsString()
  @ApiProperty({
    example: 'aura',
  })
  prefix: string;

  @IsNumber()
  @ApiProperty({
    example: 6,
  })
  coinDecimals: number;

  @IsNumber()
  @ApiProperty({
    example: 0.0002,
  })
  gasPrice: number;

  @IsString()
  @ApiProperty({
    example:
      'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/aura.png',
  })
  tokenImg: string;

  defaultGas: FindGasByChainDto[];
}
