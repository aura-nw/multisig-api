import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetSafesByOwnerAddressParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  address: string;
}
