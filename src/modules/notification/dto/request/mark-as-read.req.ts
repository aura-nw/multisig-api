import { ApiProperty } from '@nestjs/swagger';

export class MarkAsReadNotificationReq {
  @ApiProperty({
    type: Number,
    isArray: true,
    description: 'Array of notifications id',
  })
  notifications: number[];
}
