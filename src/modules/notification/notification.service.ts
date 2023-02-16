import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CommonUtil } from '../../utils/common.util';
import { ResponseDto } from '../../dtos/responses';
import { Notification } from '../../entities';
import { ErrorMap } from '../../common/error.map';
import { NotificationStatus } from '../../common/constants/app.constant';
import { MarkAsReadNotificationReq } from './dto/request/mark-as-read.req';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  private readonly _logger = new Logger(NotificationService.name);
  private utils: CommonUtil = new CommonUtil();

  constructor(private readonly repo: NotificationRepository) {
    this._logger.log(
      '============== Constructor Notification Service ==============',
    );
  }

  async getNotifications(): Promise<ResponseDto> {
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

  async markAsRead(request: MarkAsReadNotificationReq): Promise<ResponseDto> {
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
