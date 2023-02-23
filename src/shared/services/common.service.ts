import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { CustomError } from '../../common/custom-error';
import { ErrorMap } from '../../common/error.map';

@Injectable()
export class CommonService {
  constructor(private readonly httpService: HttpService) {}

  public async requestPost<T>(url: string, body: any): Promise<T> {
    const result = await firstValueFrom<T>(
      this.httpService.post<T>(url, body).pipe(
        map((res) => res.data),
        catchError((err: AxiosError) => {
          throw CustomError.fromUnknown(ErrorMap.REQUEST_ERROR, err);
        }),
      ),
    );
    return result;
  }

  public async requestGet<T>(url: string): Promise<T> {
    const result = await firstValueFrom<T>(
      this.httpService.get<T>(url).pipe(
        map((res) => res.data),
        catchError((err: AxiosError) => {
          throw CustomError.fromUnknown(ErrorMap.REQUEST_ERROR, err);
        }),
      ),
    );
    return result;
  }
}
