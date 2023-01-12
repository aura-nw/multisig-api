import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/entities';
import { ENTITIES_CONFIG } from 'src/module.config';
import { Repository } from 'typeorm';
import { INotificationService } from '../inotification.service';
import { BaseService } from './base.service';
import { plainToInstance } from 'class-transformer';
import { CommonUtil } from 'src/utils/common.util';
import { ResponseDto } from 'src/dtos/responses';
import { ErrorMap } from 'src/common/error.map';

@Injectable()
export class NotificationService
  extends BaseService
  implements INotificationService
{
  private readonly _logger = new Logger(NotificationService.name);
  private utils: CommonUtil = new CommonUtil();

  constructor(
    @InjectRepository(ENTITIES_CONFIG.NOTIFICATION)
    private readonly repo: Repository<Notification>,
  ) {
    super(repo);
    this._logger.log(
      '============== Constructor Notification Service ==============',
    );
  }

  async getNotifications(): Promise<ResponseDto> {
    const authInfo = this.utils.getAuthInfo();
    const result = await this.repo.find({
      where: { userId: authInfo.userId },
      order: { status: 'DESC', id: 'DESC' },
    });
    return ResponseDto.response(
      ErrorMap.SUCCESSFUL,
      plainToInstance(
        Notification,
        result.map((item) => this.utils.omitByNil(item)),
      ),
    );
  }
}
