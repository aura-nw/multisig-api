import { ErrorMap } from '../../common/error.map';

export class ResponseDto {
    ErrorCode: string;
    Message: string;
    Data: any;
    AdditionalData: any;

    return?(keyMassage: string | string, data?: any, additionalData?: any): ResponseDto {
        this.ErrorCode = ErrorMap[keyMassage].Code;
        this.Message = ErrorMap[keyMassage].Message;
        this.Data = data || {};
        this.AdditionalData = additionalData || [];
        return this;
        
    }
}
