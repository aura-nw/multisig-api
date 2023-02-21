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
): Promise<ChainInfo[]> => {
  const result = await Promise.all(
    chainObjects.map((chainObject) => {
      const chainInfo = plainToInstance(ChainInfo, chainObject);
      return validate(chainInfo);
    }),
  );

  const errors = result.filter((error) => error.length > 0);
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return plainToInstance(ChainInfo, chainObjects);
};
