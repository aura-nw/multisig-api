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
import { AuthUserInterceptor } from 'src/interceptors/auth-user-interceptor.service';
import { SwaggerBaseApiResponse } from 'src/dtos/responses';
import { MODULE_RESPONSE } from 'src/module.config';

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
  apiOkResponseOptions: ApiResponseOptions = {
    status: 200,
    type: SwaggerBaseApiResponse(MODULE_RESPONSE.ResponseDto),
    description: 'The result returned is the ResponseDto class',
    schema: {},
  },
) {
  return applyDecorators(
    ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} }),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary, description }),
    ApiOkResponse(apiOkResponseOptions),
  );
}

export function Auth() {
  return applyDecorators(
    UseGuards(AuthGuard('jwt'), GroupsGuard),
    ApiBearerAuth(),
    UseInterceptors(AuthUserInterceptor),
  );
}
