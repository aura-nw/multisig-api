import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserInfo } from '../dtos/userInfo';
import { AuthService } from '../services/impls/auth.service';
@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user: UserInfo = {
      address: request.user.address,
      pubkey: request.user.pubkey,
      // data: request.user.data,
      signature: request.user.signature,
    };
    AuthService.setAuthUser(user);
    return next.handle();
  }
}
