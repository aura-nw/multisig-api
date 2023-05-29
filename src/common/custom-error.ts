import { isAxiosError } from 'axios';
import { ErrorMap } from './error.map';

export class CustomError extends Error {
  constructor(
    public errorMap: typeof ErrorMap.SUCCESSFUL,
    public msg?: string,
  ) {
    super(errorMap.Code);
  }

  static fromUnknown(
    errorMap: typeof ErrorMap.SUCCESSFUL,
    error: unknown,
  ): CustomError {
    if (error instanceof CustomError) {
      return error;
    }

    if (isAxiosError(error)) {
      return new CustomError(errorMap, JSON.stringify(error.response?.data));
    }

    if (error instanceof Error) {
      return new CustomError(errorMap, error.message);
    }

    return new CustomError(errorMap, String(error));
  }
}
