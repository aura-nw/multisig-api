import { plainToInstance, Type } from 'class-transformer';
import { IsNumber, IsString, validate } from 'class-validator';

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

export const validateChainInfo = async (
  chainObjects: Record<string, unknown>[],
) => {
  const chainInfos: ChainInfo[] = [];
  for (const chainObject of chainObjects) {
    const chainInfo = plainToInstance(ChainInfo, chainObject);
    const errors = await validate(chainInfo);
    if (errors.length > 0) {
      throw new Error(errors.toString());
    }
    chainInfos.push(chainInfo);
  }
  return chainInfos;
};
