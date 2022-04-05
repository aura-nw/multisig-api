import {
  applyDecorators,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponseOptions,
} from '@nestjs/swagger';

interface Options {
  url?: string;
  summary: string;
  apiOkResponseOptions?: ApiResponseOptions;
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

export function CommonDelete(options: Options) {
  return applyDecorators(
    Common(options.summary, options.apiOkResponseOptions),
    Delete(options.url),
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
