import { ApiProperty } from '@nestjs/swagger';

export class GetSafesByOwnerAddressRequest {
  @ApiProperty()
  chainId: number;
}