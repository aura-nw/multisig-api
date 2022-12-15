import { ResponseDto } from 'src/dtos/responses';

export interface INotificationService {
  getNotifications(): Promise<ResponseDto>;
}
