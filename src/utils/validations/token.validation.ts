import { IsOptional, IsString } from 'class-validator';

export class TokenInfo {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  cw20Address: string;

  @IsString()
  @IsOptional()
  ibcDenom: string;
}
