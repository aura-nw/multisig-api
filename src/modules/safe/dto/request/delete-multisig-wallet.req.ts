import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DeleteSafePathParamsDto {
  @ApiProperty({
    description: 'safeId',
    type: Number,
  })
  @IsNumber()
  @Type(() => Number)
  safeId: number;
}
