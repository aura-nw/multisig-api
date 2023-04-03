import { ApiProperty } from '@nestjs/swagger';

export class GetUserPathParamDto {
  @ApiProperty({
    description: 'User Address',
    type: String,
  })
  address: string;
}
