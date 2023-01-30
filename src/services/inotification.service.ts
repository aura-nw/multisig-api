import { ResponseDto } from 'src/dtos/responses';
import { MODULE_REQUEST } from 'src/module.config';

export interface INotificationService {
  getNotifications(): Promise<ResponseDto>;

  markAsRead(
    request: MODULE_REQUEST.MarkAsReadNotificationReq,
  ): Promise<ResponseDto>;
}
