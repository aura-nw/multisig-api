import { Controller, Inject, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CONTROLLER_CONSTANTS } from 'src/common/constants/api.constant';
import { CommonAuthGet } from 'src/decorators/common.decorator';
import { SERVICE_INTERFACE } from 'src/module.config';
import { INotificationService } from 'src/services/inotification.service';

@Controller(CONTROLLER_CONSTANTS.NOTIFICATION)
@ApiTags(CONTROLLER_CONSTANTS.NOTIFICATION)
export class NotificationController {
  public readonly _logger = new Logger(NotificationController.name);

  constructor(
    @Inject(SERVICE_INTERFACE.INOTIFICATION_SERVICE)
    private notificationService: INotificationService,
  ) {}

  @CommonAuthGet({
    summary: 'Get notifications for current user',
    apiOkResponseOptions: {
      status: 200,
      description: 'Notifications',
      schema: {},
    },
  })
  async getNotifications() {
    this._logger.log(
      '========== Get notifications for current user ==========',
    );
    return this.notificationService.getNotifications();
  }
}
