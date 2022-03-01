import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetSafesByOwnerAddressQuery {
  @ApiProperty()
  internalChainId: number;

  @ApiProperty()
  address: string;
}
export class GetSafesByOwnerAddressParams {
  @ApiProperty()
  @IsNotEmpty()
  internalChainId: number;

  @ApiProperty()
  @IsNotEmpty()
  address: string;
}
