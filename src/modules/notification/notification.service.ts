import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CommonUtil } from '../../utils/common.util';
import { ErrorMap } from '../../common/error.map';
import { MarkAsReadNotificationReq } from './dto/request/mark-as-read.req';
import { NotificationRepository } from './notification.repository';
import { ResponseDto } from '../../common/dtos/response.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  private utils: CommonUtil = new CommonUtil();

  constructor(private readonly repo: NotificationRepository) {
    this.logger.log(
      '============== Constructor Notification Service ==============',
    );
  }

  async getNotifications(): Promise<ResponseDto<unknown>> {
    const authInfo = this.utils.getAuthInfo();
    const result = await this.repo.getNotificationsByUser(authInfo.userId);
    return ResponseDto.response(
      ErrorMap.SUCCESSFUL,
      plainToInstance(
        Notification,
        result.map((item) => this.utils.omitByNil(item)),
      ),
    );
  }

  async markAsRead(
    request: MarkAsReadNotificationReq,
  ): Promise<ResponseDto<{ affected: number }>> {
    try {
      const authInfo = this.utils.getAuthInfo();

      const { notifications } = request;

      const result = await this.repo.markNotificationsAsRead(
        notifications,
        authInfo.userId,
      );
      return ResponseDto.response(ErrorMap.SUCCESSFUL, {
        affected: result.affected,
      });
    } catch (error) {
      return ResponseDto.responseError(NotificationService.name, error);
    }
  }
}
