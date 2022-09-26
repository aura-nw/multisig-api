import { ApiProperty } from '@nestjs/swagger';

export class GetUserPathParam {
  @ApiProperty({
    description: 'User Address',
    type: String,
  })
  address: string;
}
