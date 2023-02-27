import { User } from '../../../user/entities/user.entity';

export class AuthResponseDto {
  AccessToken: string;

  user: User;
}
