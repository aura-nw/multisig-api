import { ErrorMap } from '../../common/error.map';

export class ResponseDto {
  ErrorCode: string;
  Message: string;
  Data: any;
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
}
