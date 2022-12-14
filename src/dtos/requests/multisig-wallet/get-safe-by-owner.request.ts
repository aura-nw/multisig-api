import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetSafesByOwnerAddressQuery {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  internalChainId: number;
}
export class GetSafesByOwnerAddressParams {
  @ApiProperty()
  address: string;
}
