import { Gas } from '../../../gas/entities/gas.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

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
    example: 'aura-testnet',
  })
  chainId: string;

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

  defaultGas: Gas;
}
