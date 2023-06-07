import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { CustomError } from '../../common/custom-error';
import { ErrorMap } from '../../common/error.map';
import { CommonUtil } from '../../utils/common.util';
import { ChainInfo } from '../../utils/validations';

@Injectable()
export class CommonService {
  private readonly logger = new Logger(CommonService.name);

  constructor(private readonly httpService: HttpService) {}

  public async readConfigurationFile(): Promise<ChainInfo[]> {
    const configuration = await CommonUtil.jsonReader<ChainInfo[]>(
      './chains.json',
    );
    return configuration;
  }

  public async requestPost<T>(url: string, body: unknown): Promise<T> {
    const result = await firstValueFrom<T>(
      this.httpService.post<T>(url, body).pipe(
        map((res) => res.data),
        catchError((err: AxiosError) => {
          this.logger.error(err.response?.data);
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
