import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class ChainInfo {
  @IsString()
  name: string;

  @IsString()
  rest: string;

  @IsString()
  rpc: string;

  @IsString()
  webSocket: string;

  @IsString()
  explorer: string;

  @IsString()
  symbol: string;

  @IsString()
  denom: string;

  @IsString()
  chainId: string;

  @IsString()
  prefix: string;

  @IsNumber()
  @Type(() => Number)
  coinDecimals: number;

  @IsNumber()
  @Type(() => Number)
  gasPrice: number;

  @IsString()
  tokenImg: string;
}
