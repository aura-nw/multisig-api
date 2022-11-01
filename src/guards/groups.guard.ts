import {
  CACHE_MANAGER,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { CommonUtil } from '../utils/common.util';
@Injectable()
export class GroupsGuard implements CanActivate {
  private _commonUtil: CommonUtil = new CommonUtil();
  constructor(
    private readonly _reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this._reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }
    //check group of user
    const request = context.switchToHttp().getRequest();
    const userRole = request.user['role'];
    if (roles.includes(userRole)) {
      return true;
    }
    return false;
  }
}
