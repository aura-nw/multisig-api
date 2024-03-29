import { Controller, Body, Param, Logger, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from '../../common/constants/api.constant';
import {
  CommonAuthDelete,
  CommonAuthPost,
  CommonGet,
} from '../../decorators/common.decorator';
import { SafeService } from './safe.service';
import { CreateMultisigWalletRequestDto } from './dto/request/create-multisig-wallet.req';
import { GetSafePathParamsDto } from './dto/request/get-safe.request';
import { ConfirmSafePathParamsDto } from './dto/request/confirm-multisig-wallet.req';
import { DeleteSafePathParamsDto } from './dto/request/delete-multisig-wallet.req';
import { GetSafeQueryDto } from './dto/request/get-safe-query.req';
import { ResponseDto } from '../../common/dtos/response.dto';

@Controller(CONTROLLER_CONSTANTS.MULTISIG_WALLET)
@ApiTags(CONTROLLER_CONSTANTS.MULTISIG_WALLET)
export class SafeController {
  private readonly logger = new Logger(SafeController.name);

  constructor(private multisigWalletService: SafeService) {}

  @CommonAuthPost({
    summary: 'Create a multisig wallet',
    apiOkResponseOptions: {
      status: 200,
      type: ResponseDto,
      description: 'Safe information',
      schema: {},
    },
  })
  async createMultisigWallet(@Body() request: CreateMultisigWalletRequestDto) {
    this.logger.log('========== Create a multisig wallet ==========');
    return this.multisigWalletService.createMultisigWallet(request);
  }

  @CommonGet({
    url: URL_CONSTANTS.GET_SAFE,
    summary: 'Get status of the multisig wallet by safeId',
    apiOkResponseOptions: {
      status: 200,
      type: ResponseDto,
      description: 'Status of multisig wallet',
      schema: {},
    },
  })
  async getMultisigWallet(
    @Param() param: GetSafePathParamsDto,
    @Query() query: GetSafeQueryDto,
  ) {
    this.logger.log(
      '========== Get status of the multisig wallet by safeId ==========',
    );
    return this.multisigWalletService.getMultisigWallet(param, query);
  }

  @CommonAuthPost({
    url: URL_CONSTANTS.CONFIRM_SAFE,
    summary: 'Confirm multisig wallet',
  })
  async confirmMultisigWallet(@Param() param: ConfirmSafePathParamsDto) {
    this.logger.log('========== Confirm multisig wallet ==========');
    return this.multisigWalletService.confirm(param);
  }

  @CommonAuthDelete({
    url: URL_CONSTANTS.DELETE_SAFE,
    summary: 'Delete pending multisig wallet',
  })
  async deletePendingMultisigWallet(@Param() param: DeleteSafePathParamsDto) {
    this.logger.log('========== Delete pending multisig wallet ==========');
    return this.multisigWalletService.deletePending(param);
  }
}
