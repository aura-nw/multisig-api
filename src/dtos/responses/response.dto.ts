import { ApiProperty } from '@nestjs/swagger';
import { ErrorMap } from '../../common/error.map';

export class ResponseDto {
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
  Data: any;
  @ApiProperty({ description: 'Data return' })
  AdditionalData: any;

  return?(
    errorMap: typeof ErrorMap.SUCCESSFUL,
    data?: any,
    additionalData?: any,
  ): ResponseDto {
    this.ErrorCode = errorMap.Code;
    this.Message = errorMap.Message;
    this.Data = data || {};
    this.AdditionalData = additionalData || [];
    return this;
  }

  public static response(
    errorMap: typeof ErrorMap.SUCCESSFUL,
    data?: any,
    additionalData?: any,
  ) {
    const res = new ResponseDto();
    return res.return(errorMap, data, additionalData);
  }
}

export function SwaggerBaseApiResponse<T>(type: T): typeof ResponseDto {
  class ExtendedBaseApiResponse<T> extends ResponseDto {
    @ApiProperty({ type })
    public Data: T;
  }
  const isAnArray = Array.isArray(type) ? ' [ ] ' : '';
  Object.defineProperty(ExtendedBaseApiResponse, 'name', {
    value: `SwaggerBaseApiResponseFor ${type} ${isAnArray}`,
  });

  return ExtendedBaseApiResponse;
}
