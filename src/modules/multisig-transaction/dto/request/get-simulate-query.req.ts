import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetSimulateAddressQueryDto {
  @IsNumber()
  @ApiProperty({
    description: 'Offchain Chain Id',
    example: 22,
  })
  @Type(() => Number)
  internalChainId: number;
}
