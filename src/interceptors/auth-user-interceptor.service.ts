import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../modules/user/entities/user.entity';
import { ContextProvider } from '../providers/contex.provider';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  // eslint-disable-next-line class-methods-use-this
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();

    const user = <User>request.user;
    ContextProvider.setAuthUser(user);

    return next.handle();
  }
}
