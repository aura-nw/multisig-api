import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfirmSafePathParams {
  @ApiProperty({
    description: 'safeId',
    type: String,
  })
  @IsString()
  safeId: string;
}
