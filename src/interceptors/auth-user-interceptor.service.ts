import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../modules/auth/auth.service';
import { UserInfoDto } from '../modules/auth/dto/user-info.dto';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user: UserInfoDto = {
      userId: request.user.userId,
      address: request.user.address,
      pubkey: request.user.pubkey,
      // data: request.user.data,
      signature: request.user.signature,
    };
    AuthService.setAuthUser(user);
    return next.handle();
  }
}
