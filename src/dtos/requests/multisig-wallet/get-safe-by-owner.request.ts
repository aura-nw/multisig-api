import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetSafesByOwnerAddressQuery {
  @IsNumber()
  @ApiProperty()
  internalChainId: number;
}
export class GetSafesByOwnerAddressParams {
  @ApiProperty()
  address: string;
}
