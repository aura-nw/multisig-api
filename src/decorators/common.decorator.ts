import {
  applyDecorators,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation } from '@nestjs/swagger';

interface Options {
  url?: string;
  summary: string;
}

export function CommonPost(options: Options) {
  return applyDecorators(Common(options.summary), Post(options.url));
}

export function CommonGet(options: Options) {
  return applyDecorators(Common(options.summary), Get(options.url));
}

export function CommonDelete(options: Options) {
  return applyDecorators(Common(options.summary), Delete(options.url));
}

export function Common(summary: string) {
  return applyDecorators(
    ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} }),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary }),
  );
}
