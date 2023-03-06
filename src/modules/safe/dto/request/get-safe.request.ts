import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetSafePathParamsDto {
  @ApiProperty({
    description: 'safeId or safeAddress',
    type: String,
  })
  @IsString()
  safeId: string;
}
