import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserInfoDto } from '../modules/auth/dto';
import { ContextProvider } from '../providers/contex.provider';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  // eslint-disable-next-line class-methods-use-this
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();

    const user = <UserInfoDto>request.user;
    ContextProvider.setAuthUser(user);

    return next.handle();
  }
}
