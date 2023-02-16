import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetSafesByOwnerAddressQueryDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  internalChainId: number;
}
export class GetSafesByOwnerAddressParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  address: string;
}
