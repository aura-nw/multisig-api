import { Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CustomError } from '../custom-error';
import { ErrorMap } from '../error.map';

export class ResponseDto<T> {
  @ApiProperty({
    description: 'Return Error Code',
    type: 'string',
    example: ErrorMap.SUCCESSFUL.Code,
  })
  ErrorCode: string;

  @ApiProperty({
    description: 'Return Error Message',
    type: 'string',
    example: ErrorMap.SUCCESSFUL.Code,
  })
  Message: string;

  @ApiProperty({ description: 'Data return', type: 'object' })
  Data: T;

  @ApiProperty({ description: 'Data return' })
  AdditionalData: unknown;

  constructor(
    errorMap: typeof ErrorMap.SUCCESSFUL,
    data?: T,
    additionalData?: unknown,
  ) {
    this.ErrorCode = errorMap.Code;
    this.Message = errorMap.Message;
    this.Data = data || undefined;
    this.AdditionalData = additionalData || [];
  }

  public static response<T>(
    errorMap: typeof ErrorMap.SUCCESSFUL,
    data?: T,
    additionalData?: unknown,
  ) {
    return new ResponseDto<T>(errorMap, data, additionalData);
  }

  public static responseError<T>(moduleName: string, error: unknown) {
    if (error instanceof CustomError)
      return this.response<T>(error.errorMap, undefined, error.msg);

    const logger = new Logger(moduleName);
    logger.error(error);
    logger.error(`${ErrorMap.E500.Code}: ${ErrorMap.E500.Message}`);

    return ResponseDto.response<T>(
      ErrorMap.E500,
      undefined,
      Object.hasOwnProperty('message') ? (error as Error).message : error,
    );
  }
}
