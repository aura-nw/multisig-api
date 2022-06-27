import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from 'src/services/impls/auth.service';
@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = {
      address: request.user.address,
      pubkey: request.user.pubkey,
      data: request.user.data,
      signature: request.user.signature,
    };
    console.log(user);
    AuthService.setAuthUser(user);
    return next.handle();
  }
}
