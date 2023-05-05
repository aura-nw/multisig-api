import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class TokenInfo {
  @IsString()
  name: string;

  @IsString()
  display: string;

  @IsString()
  denom: string;

  @IsString()
  logo: string;

  @IsNumber()
  @Type(() => Number)
  decimal: number;

  @IsString()
  tokenType: string;
}
