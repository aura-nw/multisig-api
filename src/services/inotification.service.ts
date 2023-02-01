import { ResponseDto } from '../dtos/responses';
import { MODULE_REQUEST } from '../module.config';

export interface INotificationService {
  getNotifications(): Promise<ResponseDto>;

  markAsRead(
    request: MODULE_REQUEST.MarkAsReadNotificationReq,
  ): Promise<ResponseDto>;
}
