import { Expose } from 'class-transformer';
import { ChainDto } from './chain-info.res';
import { TokenInfo } from '../../../../utils/validations';

export class NetworkListResponseDto {
  @Expose()
  chains: ChainDto[];

  @Expose()
  tokens: TokenInfo[];
}
