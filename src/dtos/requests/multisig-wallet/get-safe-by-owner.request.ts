import { ApiProperty } from '@nestjs/swagger';

export class GetSafesByOwnerAddressQuery {
  @ApiProperty()
  internalChainId: number;

  @ApiProperty()
  address: string;
}
