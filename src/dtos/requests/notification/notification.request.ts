import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetNotificationRequest {
  @ApiProperty({
    type: Number,
    description: 'userId of the user who is requesting the notification',
  })
  @IsNumber()
  @Type(() => Number)
  userId: number;
}

export class MarkAsReadNotificationReq {
  @ApiProperty({
    type: Number,
    isArray: true,
    description: 'Array of notifications id',
  })
  notifications: number[];
}
