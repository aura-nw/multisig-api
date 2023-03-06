import { Controller, Get, Query, Logger, Param } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from '../../common/constants/api.constant';
import { GetSafesByOwnerAddressParamsDto } from '../safe/dto/request/get-safe-by-owner-param.req';
import { GetSafesByOwnerAddressQueryDto } from './dto/request/get-safe-owners.req';
import { SafeOwnerService } from './safe-owner.service';

@Controller(CONTROLLER_CONSTANTS.OWNER)
@ApiTags(CONTROLLER_CONSTANTS.OWNER)
export class SafeOwnerController {
  public readonly logger = new Logger(SafeOwnerController.name);

  constructor(private safeOwnerService: SafeOwnerService) {}

  @Get(URL_CONSTANTS.GET_SAFES_BY_OWNER)
  @ApiOperation({
    summary: 'Get Safes by where the owner address',
  })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', schema: {} })
  async getSafes(
    @Param() param: GetSafesByOwnerAddressParamsDto,
    @Query() query: GetSafesByOwnerAddressQueryDto,
  ) {
    this.logger.log(
      '========== Return Safes where the address provided is an owner ==========',
    );
    return this.safeOwnerService.getMultisigWalletsByOwner(param, query);
  }
}
