import { Body, Controller, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CONTROLLER_CONSTANTS } from '../../common/constants/api.constant';
import {
  CommonAuthGet,
  CommonAuthPost,
} from '../../decorators/common.decorator';
import { MarkAsReadNotificationReq } from './dto/request/mark-as-read.req';
import { NotificationService } from './notification.service';

@Controller(CONTROLLER_CONSTANTS.NOTIFICATION)
@ApiTags(CONTROLLER_CONSTANTS.NOTIFICATION)
export class NotificationController {
  public readonly logger = new Logger(NotificationController.name);

  constructor(private notificationService: NotificationService) {}

  @CommonAuthGet({
    summary: 'Get notifications for current user',
    apiOkResponseOptions: {
      status: 200,
      description: 'Notifications',
      schema: {},
    },
  })
  async getNotifications() {
    this.logger.log('========== Get notifications for current user ==========');
    return this.notificationService.getNotifications();
  }

  @CommonAuthPost({
    summary: 'Mark notifications as read',
    apiOkResponseOptions: {
      status: 200,
      description: 'Notifications',
      schema: {},
    },
  })
  async markAsRead(@Body() param: MarkAsReadNotificationReq) {
    this.logger.log('========== Mark notifications as read ==========');
    return this.notificationService.markAsRead(param);
  }
}
