import { Gas } from '../../../gas/entities/gas.entity';

export class NetworkListResDto {
  id: number;
  name: string;
  rest: string;
  rpc: string;
  explorer: string;
  chainId: string;
  symbol: string;
  denom: string;
  prefix: string;
  coinDecimals: number;
  gasPrice: number;
  tokenImg: string;
  defaultGas: Gas;
}
