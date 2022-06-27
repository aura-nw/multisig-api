import {
  applyDecorators,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GroupsGuard } from 'src/guards/groups.guard';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponseOptions,
} from '@nestjs/swagger';
import exp from 'constants';
import { AuthUserInterceptor } from 'src/interceptors/auth-user-interceptor.service';

interface Options {
  url?: string;
  summary: string;
  apiOkResponseOptions?: ApiResponseOptions;
}

export function CommonAuthPost(options: Options) {
  return applyDecorators(
    Common(options.summary, options.apiOkResponseOptions),
    AuthPost(options),
  );
}

export function CommonPost(options: Options) {
  return applyDecorators(
    Common(options.summary, options.apiOkResponseOptions),
    Post(options.url),
  );
}

export function CommonGet(options: Options) {
  return applyDecorators(
    Common(options.summary, options.apiOkResponseOptions),
    Get(options.url),
  );
}

export function CommonAuthDelete(options: Options) {
  return applyDecorators(
    Common(options.summary, options.apiOkResponseOptions),
    Delete(options.url),
    UseGuards(AuthGuard('jwt'), GroupsGuard),
    ApiBearerAuth(),
    UseInterceptors(AuthUserInterceptor)
  );
}

export function AuthPost(options: Options) {
  return applyDecorators(
    UseGuards(AuthGuard('jwt'), GroupsGuard),
    ApiBearerAuth(),
    Post(options.url),
    UseInterceptors(AuthUserInterceptor)
  );
}

export function Common(
  summary: string,
  apiOkResponseOptions?: ApiResponseOptions,
) {
  return applyDecorators(
    ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} }),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary }),
    ApiOkResponse(apiOkResponseOptions),
    
  );
}
