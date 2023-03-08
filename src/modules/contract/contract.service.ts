import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CustomError } from '../../common/custom-error';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { CommonService } from '../../shared/services';
import { ChainRepository } from '../chain/chain.repository';
import { GetContractStatusQueryDto, GetContractStatusReqDto } from './dto';
import { GetContractStatusResDto } from './dto/response/get-contract-status.res';
import { IAuraContractDetail, IAuraScanResponseDto } from './interface';

@Injectable()
export class ContractService {
  constructor(
    private commonServer: CommonService,
    private chainRepo: ChainRepository,
  ) {}

  async getContractStatus(
    param: GetContractStatusReqDto,
    query: GetContractStatusQueryDto,
  ): Promise<ResponseDto<GetContractStatusResDto>> {
    try {
      const { contractAddress } = param;
      const { internalChainId } = query;

      let verification = false;
      let verifiedAt: string;
      let executeMsgSchema: string;

      const chainInfo = await this.chainRepo.findChain(internalChainId);
      if (!contractAddress.startsWith(chainInfo.prefix)) {
        throw new CustomError(ErrorMap.INVALID_CONTRACT_ADDRESS);
      }

      if (chainInfo.contractAPI) {
        const contract = await this.commonServer.requestGet<
          IAuraScanResponseDto<IAuraContractDetail>
        >(
          new URL(
            chainInfo.contractAPI.replace('$contract_address', contractAddress),
          ).href,
        );

        if (contract.data !== null) {
          verification = contract.data.contract_verification === 'VERIFIED';
          verifiedAt = contract.data.verified_at;
          executeMsgSchema = contract.data.execute_msg_schema;
        }
      }

      return ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        plainToInstance(GetContractStatusResDto, {
          contractAddress,
          verification,
          verifiedAt,
          executeMsgSchema,
        }),
      );
    } catch (error) {
      return ResponseDto.responseError(ContractService.name, error);
    }
  }
}
