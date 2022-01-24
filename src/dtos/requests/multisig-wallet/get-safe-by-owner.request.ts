import { ApiProperty } from '@nestjs/swagger';

export class GetSafesByOwnerAddressRequest {
  @ApiProperty()
  internalChainId: number;
}