import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomError } from '../../common/custom-error';
import { ErrorMap } from '../../common/error.map';
import { SimulateResponse } from '../../modules/simulate/dtos/simulate-response';
import { CommonService } from './common.service';
import { SimulateDto } from '../dtos';

@Injectable()
export class LcdClient {
  lcdUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,
  ) {
    this.lcdUrl = this.configService.get<string>('LCD_URL');
  }

  async simulate(txBytesBase64: string): Promise<SimulateResponse> {
    try {
      const url = new URL('cosmos/tx/v1beta1/simulate', this.lcdUrl);
      const simulateRes = await this.commonService.requestPost<SimulateDto>(
        url.href,
        {
          tx_bytes: txBytesBase64,
        },
      );

      return {
        gasUsed: simulateRes.gas_info?.gas_used || 0,
      };
    } catch (error) {
      throw CustomError.fromUnknown(ErrorMap.TX_SIMULATION_FAILED, error);
    }
  }
}
