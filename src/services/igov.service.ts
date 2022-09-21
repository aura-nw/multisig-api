import { ResponseDto } from 'src/dtos/responses/response.dto';
import { MODULE_REQUEST } from 'src/module.config';

export interface IGovService {
  /**
   * get gov proposals
   */
  getProposals(param: MODULE_REQUEST.GetProposalsParam): Promise<ResponseDto>;

  /**
   * get gov proposal
   */
  getProposalById(
    param: MODULE_REQUEST.GetProposalDetailsParam,
  ): Promise<ResponseDto>;

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
}
