import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetSafesByOwnerAddressQuery {
  @ApiProperty()
  internalChainId: number;
}
export class GetSafesByOwnerAddressParams {
  @ApiProperty()
  address: string;
}
