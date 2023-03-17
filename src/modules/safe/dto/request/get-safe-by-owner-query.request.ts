import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetSafesByOwnerAddressQueryDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  internalChainId: number;
}
