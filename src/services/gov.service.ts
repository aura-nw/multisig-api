import { ResponseDto } from 'src/dtos/responses/response.dto';
import { MODULE_REQUEST } from 'src/module.config';

export interface IGovService {
  /**
   * get gov proposals
   */
  getProposals(param: MODULE_REQUEST.GetProposalsParam): Promise<ResponseDto>;

  // getProposalById(param: MODULE_REQUEST.GetProposalByIdPathParams): Promise<ResponseDto>;

  // getProposalTallyById(param: MODULE_REQUEST.GetProposalTallyByIdPathParams): Promise<ResponseDto>;

  // getProposalVotesById(param: MODULE_REQUEST.GetProposalVotesByIdPathParams): Promise<ResponseDto>;

  // getProposalDepositsById(param: MODULE_REQUEST.GetProposalDepositsByIdPathParams): Promise<ResponseDto>;

  // getProposalDepositById(param: MODULE_REQUEST.GetProposalDepositByIdPathParams): Promise<ResponseDto>;

  // getProposalVoteById(param: MODULE_REQUEST.GetProposalVoteByIdPathParams): Promise<ResponseDto>;

  // getProposalVotesByVoter(param: MODULE_REQUEST.GetProposalVotesByVoterPathParams): Promise<ResponseDto>;

  // getProposalDepositsByDepositor(param: MODULE_REQUEST.GetProposalDepositsByDepositorPathParams): Promise<ResponseDto>;

  // getProposalDepositByDepositor(param: MODULE_REQUEST.GetProposalDepositByDepositorPathParams): Promise<ResponseDto>;

  // getProposalVoteByVoter(param: MODULE_REQUEST.GetProposalVoteByVoterPathParams): Promise<ResponseDto>;
}
