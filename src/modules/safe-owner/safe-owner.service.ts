import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  SafeOwnerStatus,
  SafeStatus,
} from '../../common/constants/app.constant';
import { ErrorMap } from '../../common/error.map';
import { ResponseDto } from '../../common/dtos/response.dto';
import { CommonUtil } from '../../utils/common.util';
import { GetSafesByOwnerAddressQueryDto } from './dto/request/get-safe-owners.req';
import { ListSafeByOwnerResponseDto } from './dto/response/get-safe-by-owner.res';
import { SafeOwnerRepository } from './safe-owner.repository';
import { GetSafesByOwnerAddressParamsDto } from '../safe/dto/request/get-safe-by-owner-param.req';

@Injectable()
export class SafeOwnerService {
  private readonly logger = new Logger(SafeOwnerService.name);

  private utils: CommonUtil = new CommonUtil();

  constructor(private readonly repo: SafeOwnerRepository) {
    this.logger.log(
      '============== Constructor Notification Service ==============',
    );
  }

  async getMultisigWalletsByOwner(
    param: GetSafesByOwnerAddressParamsDto,
    query: GetSafesByOwnerAddressQueryDto,
  ): Promise<ResponseDto<ListSafeByOwnerResponseDto[]>> {
    try {
      const { address } = param;
      const { internalChainId } = query;
      const result = await this.repo.getMultisigWalletsByOwner(
        address,
        internalChainId,
      );
      const listSafe = plainToInstance(ListSafeByOwnerResponseDto, result);
      const response = listSafe.map((res) => {
        if (
          res.status === SafeStatus.PENDING &&
          res.creatorAddress !== res.ownerAddress
        ) {
          res.status =
            res.ownerPubkey === null
              ? SafeOwnerStatus.NEED_CONFIRM
              : SafeOwnerStatus.CONFIRMED;
        }
        return res;
      });
      return ResponseDto.response(ErrorMap.SUCCESSFUL, response);
    } catch (error) {
      return ResponseDto.responseError(SafeOwnerService.name, error);
    }
  }
}
