import { Controller, Logger, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CONTROLLER_CONSTANTS,
  URL_CONSTANTS,
} from '../../common/constants/api.constant';
import { ResponseDto } from '../../common/dtos/response.dto';
import { CommonGet } from '../../decorators/common.decorator';
import { ContractService } from './contract.service';
import { GetContractStatusQueryDto, GetContractStatusReqDto } from './dto';
import { GetContractStatusResDto } from './dto/response/get-contract-status.res';

@Controller(CONTROLLER_CONSTANTS.CONTRACT)
@ApiTags(CONTROLLER_CONSTANTS.CONTRACT)
export class ContractController {
  private readonly logger = new Logger(ContractController.name);

  constructor(private readonly contractService: ContractService) {}

  @CommonGet({
    url: URL_CONSTANTS.GET_CONTRACT_BY_ADDRESS,
    summary: 'Get contract status',
    apiOkResponseOptions: {
      status: 200,
      type: ResponseDto,
      description: 'Get contract status',
      schema: {},
    },
  })
  async getContractStatus(
    @Param() param: GetContractStatusReqDto,
    @Query() query: GetContractStatusQueryDto,
  ): Promise<ResponseDto<GetContractStatusResDto>> {
    this.logger.log('========== Get status of contract ==========');
    return this.contractService.getContractStatus(param, query);
  }
}
