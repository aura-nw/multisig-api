import { ResponseDto } from '../dtos/responses/response.dto';
import { MODULE_REQUEST } from '../module.config';

export interface IGovService {
  /**
   * get gov proposals
   */
  getProposals(param: MODULE_REQUEST.GetProposalsParam): Promise<ResponseDto>;

  /**
   * get gov proposal
   */
  getProposalById(param: MODULE_REQUEST.GetProposalParam): Promise<ResponseDto>;

  /**
   *
   * @param param
   */
  getProposalDepositById(
    param: MODULE_REQUEST.GetProposalDepositsByIdPathParams,
  ): Promise<ResponseDto>;

  getVotesByProposalId(
    param: MODULE_REQUEST.GetVotesByProposalIdParams,
    query: MODULE_REQUEST.GetVotesByProposalIdQuery,
  ): Promise<ResponseDto>;

  getValidatorVotesByProposalId(
    param: MODULE_REQUEST.GetValidatorVotesByProposalIdParams,
  ): Promise<ResponseDto>;
}
