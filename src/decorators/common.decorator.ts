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
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponseOptions,
} from '@nestjs/swagger';
import { AuthUserInterceptor } from '../interceptors/auth-user-interceptor.service';
import { ResponseDto } from '../common/dtos/response.dto';

interface Options {
  url?: string;
  summary: string;
  apiOkResponseOptions?: ApiResponseOptions;
  description?: string;
}

export function CommonAuthPost(options: Options) {
  return applyDecorators(CommonPost(options), Auth());
}

export function CommonAuthDelete(options: Options) {
  return applyDecorators(CommonDelete(options), Auth());
}

export function CommonAuthGet(options: Options) {
  return applyDecorators(CommonGet(options), Auth());
}

export function CommonPost(options: Options) {
  return applyDecorators(
    Common(options.summary, options.description, options.apiOkResponseOptions),
    Post(options.url),
  );
}

export function CommonGet(options: Options) {
  return applyDecorators(
    Common(options.summary, options.description, options.apiOkResponseOptions),
    Get(options.url),
  );
}

export function CommonDelete(options: Options) {
  return applyDecorators(
    Common(options.summary, options.description, options.apiOkResponseOptions),
    Delete(options.url),
  );
}

export function Common(
  summary: string,
  description?: string,
  apiOkResponseOptions?: ApiResponseOptions,
) {
  return applyDecorators(
    ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} }),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary, description }),
    ApiOkResponse({
      status: 200,
      type: ResponseDto,
      description: 'The result returned is the ResponseDto class',
      schema: {},
      ...apiOkResponseOptions,
    }),
  );
}

export function Auth() {
  return applyDecorators(
    UseGuards(AuthGuard('jwt')),
    ApiBearerAuth(),
    UseInterceptors(AuthUserInterceptor),
  );
}
