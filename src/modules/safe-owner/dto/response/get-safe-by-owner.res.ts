import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ListSafeByOwnerResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  safeAddress: string;

  @Expose()
  @ApiProperty()
  creatorAddress: string;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @ApiProperty()
  ownerAddress: string;

  @Expose()
  @ApiProperty()
  ownerPubkey: string;

  @Expose()
  @ApiProperty()
  internalChainId: number;
}
