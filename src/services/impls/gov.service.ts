import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import {
  MODULE_REQUEST,
  REPOSITORY_INTERFACE,
  RESPONSE_CONFIG,
} from 'src/module.config';
import { CommonUtil } from 'src/utils/common.util';
import { IGovService } from '../igov.service';
import { IGeneralRepository } from 'src/repositories';
import { Chain } from 'src/entities';
import { ConfigService } from 'src/shared/services/config.service';
import { ProposalDepositResponse } from 'src/dtos/responses';
import { PROPOSAL_STATUS } from 'src/common/constants/app.constant';
import {
  GetProposalsProposal,
  GetProposalsResponse,
  GetProposalsTally,
  GetProposalsTurnout,
} from 'src/dtos/responses/gov/get-proposals.response';
import {
  GetVotesByProposalIdResponse,
  GetVotesVote,
} from 'src/dtos/responses/gov/get-votes-by-proposal-id.response';

@Injectable()
export class GovService implements IGovService {
  private readonly _logger = new Logger(GovService.name);
  private _commonUtil: CommonUtil = new CommonUtil();
  auraChain: Chain;
  indexerUrl: string;

  constructor(
    private configService: ConfigService,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private chainRepo: IGeneralRepository,
  ) {
    this._logger.log(
      '============== Constructor Multisig Wallet Service ==============',
    );
    this.indexerUrl = this.configService.get('INDEXER_URL');
  }

  async getProposals(param: MODULE_REQUEST.GetProposalsParam) {
    const { internalChainId } = param;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);
      const response = await this._commonUtil.request(
        new URL(
          `api/v1/proposal?chainid=${chain.chainId}&pageLimit=7&pageOffset=0`,
          this.indexerUrl,
        ).href,
      );
      const proposals = response.data.proposals;
      const results: GetProposalsResponse = {
        proposals: [],
      };
      for (const proposal of proposals) {
        const result = this.mapProposal(proposal);
        results.proposals.push(result);
      }
      return ResponseDto.response(ErrorMap.SUCCESSFUL, results);
    } catch (e) {
      return ResponseDto.responseError(GovService.name, e);
    }
  }

  mapProposal(proposal: any): GetProposalsProposal {
    const result: GetProposalsProposal = {
      id: proposal.proposal_id,
      title: proposal.content.title,
      proposer: proposal.proposer_address,
      status: proposal.status,
      votingStart: proposal.voting_start_time,
      votingEnd: proposal.voting_end_time,
      submitTime: proposal.submit_time,
      totalDeposit: proposal.total_deposit,
      tally: this.calculateProposalTally(proposal),
    };
    return result;
  }

  calculateProposalTally(proposal: any): GetProposalsTally {
    //default to final result of tally property
    let tally = proposal.final_tally_result;
    if (proposal.status === PROPOSAL_STATUS.VOTING_PERIOD) {
      tally = proposal.tally;
    }
    //default mostVoted to yes
    let mostVotedOptionKey = Object.keys(tally)[0];
    // calculate sum to determine percentage
    let sum = 0;
    for (const key in tally) {
      if (+tally[key] > +tally[mostVotedOptionKey]) {
        mostVotedOptionKey = key;
      }
      sum += +tally[key];
    }

    const result: GetProposalsTally = {
      yes: {
        number: tally.yes,
        percent: this._commonUtil.getPercentage(tally.yes, sum),
      },
      abstain: {
        number: tally.abstain,
        percent: this._commonUtil.getPercentage(tally.abstain, sum),
      },
      no: {
        number: tally.no,
        percent: this._commonUtil.getPercentage(tally.no, sum),
      },
      noWithVeto: {
        number: tally.no_with_veto,
        percent: this._commonUtil.getPercentage(tally.no_with_veto, sum),
      },
      mostVotedOn: {
        name: mostVotedOptionKey,
        percent: this._commonUtil.getPercentage(tally[mostVotedOptionKey], sum),
      },
    };
    return result;
  }

  async getProposalById(param: MODULE_REQUEST.GetProposalParam) {
    const { internalChainId, proposalId } = param;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);
      const response = await this._commonUtil.request(
        new URL(
          `api/v1/proposal?chainid=${chain.chainId}&proposalId=${proposalId}`,
          this.indexerUrl,
        ).href,
      );
      const proposal = response.data.proposals[0];
      const result = this.mapProposal(proposal);
      //add additional properties for proposal details page
      const networkStatus = await this._commonUtil.request(
        new URL(
          `api/v1/network/status?chainid=${chain.chainId}`,
          this.indexerUrl,
        ).href,
      );
      const bondedTokens = networkStatus.data.pool.bonded_tokens;
      result.description = proposal.content.description;
      result.type = proposal.content['@type'];
      result.depositEndTime = proposal.deposit_end_time;
      result.turnout = this.calculateProposalTunrout(proposal, bondedTokens);
      return ResponseDto.response(ErrorMap.SUCCESSFUL, result);
    } catch (e) {
      return ResponseDto.responseError(GovService.name, e);
    }
  }

  calculateProposalTunrout(proposal: any, bondedTokens: string) {
    //default to final result of tally property
    let tally = proposal.final_tally_result;
    if (proposal.status === PROPOSAL_STATUS.VOTING_PERIOD) {
      tally = proposal.tally;
    }
    const numberOfVoted = +tally.yes + +tally.no + +tally.no_with_veto;
    const numberOfNotVoted = +bondedTokens - numberOfVoted - +tally.abstain;
    const result: GetProposalsTurnout = {
      voted: {
        number: numberOfVoted.toString(),
        percent: this._commonUtil.getPercentage(numberOfVoted, bondedTokens),
      },
      votedAbstain: {
        number: tally.abstain,
        percent: this._commonUtil.getPercentage(tally.abstain, bondedTokens),
      },
      didNotVote: {
        number: numberOfNotVoted.toString(),
        percent: this._commonUtil.getPercentage(numberOfNotVoted, bondedTokens),
      },
    };
    return result;
  }

  async getVotesByProposalId(
    param: MODULE_REQUEST.GetVotesByProposalIdParams,
    query: MODULE_REQUEST.GetVotesByProposalIdQuery,
  ): Promise<ResponseDto> {
    const { internalChainId, proposalId } = param;
    const {
      answer,
      nextKey,
      pageLimit = 45,
      pageOffset = 0,
      reverse = false,
    } = query;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);
      let url = `api/v1/votes?chainid=${chain.chainId}&proposalid=${proposalId}`;

      url += answer ? `&answer=${answer}` : ''; //optional
      url += nextKey ? `&nextKey=${nextKey}` : ''; //optional
      url += pageOffset ? `&pageOffset=${pageOffset}` : '&pageOffset=0'; //optional
      url += pageLimit ? `&pageLimit=${pageLimit}` : '&pageLimit=45'; //optional
      url += reverse ? `&reverse=${reverse}` : ''; //optional

      const response = await this._commonUtil.request(
        new URL(url, this.indexerUrl).href,
      );
      const votes = response.data.votes;
      const results: GetVotesByProposalIdResponse = {
        votes: [],
        nextKey: response.data.nextKey,
      };
      for (const vote of votes) {
        const result: GetVotesVote = {
          voter: vote.voter_address,
          txHash: vote.txhash,
          answer: vote.answer,
          time: vote.timestamp,
        };
        results.votes.push(result);
      }
      return ResponseDto.response(ErrorMap.SUCCESSFUL, results);
    } catch (e) {
      return ResponseDto.responseError(GovService.name, e);
    }
  }

  async getValidatorVotesByProposalId(
    param: MODULE_REQUEST.GetValidatorVotesByProposalIdParams,
  ): Promise<ResponseDto> {
    const { internalChainId, proposalId } = param;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);
      const url = `api/v1/votes/validators?chainid=${chain.chainId}&proposalid=${proposalId}`;

      /** Example data
       * {
          "rank": "1",
          "percent_voting_power": 2.771891,
          "validator_address": "aura1etx55kw7tkmnjqz0k0mups4ewxlr324twrzdul",
          "operator_address": "auravaloper1etx55kw7tkmnjqz0k0mups4ewxlr324t43n9yp",
          "validator_identity": "94EFE192B2C52424",
          "validator_name": "NodeStake",
          "answer": "VOTE_OPTION_YES",
          "tx_hash": "F41AAA9488DFC7DDD7A19956C072123699DD74C2BECE28A8193517FE492C7646",
          "timestamp": "2022-09-07T12:06:49.000Z"
        },
       */
      const response = await this._commonUtil.request(
        new URL(url, this.indexerUrl).href,
      );

      return ResponseDto.response(ErrorMap.SUCCESSFUL, response.data);
    } catch (e) {
      return ResponseDto.responseError(GovService.name, e);
    }
  }

  async getProposalDepositById(
    param: MODULE_REQUEST.GetProposalDepositsByIdPathParams,
  ): Promise<ResponseDto> {
    const { internalChainId, proposalId } = param;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);

      // Get proposal deposit txs
      const getProposalDepositsURL = new URL(
        `api/v1/transaction?chainid=${chain.chainId}&searchType=proposal_deposit&searchKey=proposal_id&searchValue=${proposalId}&pageOffset=0&pageLimit=10&countTotal=false&reverse=false`,
        this.indexerUrl,
      ).href;
      const depositTxs = await this._commonUtil.request(getProposalDepositsURL);
      const response: ProposalDepositResponse[] = [];

      for (const tx of depositTxs.data.transactions) {
        // const deposit = tx.tx.value.msg[0].value;
        const proposalDepositEvent = tx.tx_response.logs[0].events.find(
          (x) => x.type === 'proposal_deposit',
        );
        const proposalDepositResponse: ProposalDepositResponse = {
          proposal_id: Number(
            proposalDepositEvent?.attributes.find(
              (x) => x.key === 'proposal_id',
            )?.value,
          ),
          depositor: tx.tx_response.tx.body.messages[0].proposer,
          tx_hash: tx.tx_response.txhash,
          amount: Number(
            tx.tx_response.tx.body.messages[0].initial_deposit[0]?.amount ||
              tx.tx_response.tx.body.messages[0].amount[0]?.amount ||
              0,
          ),
          timestamp: tx.tx_response.timestamp,
        };
        response.push(proposalDepositResponse);
      }
      return ResponseDto.response(ErrorMap.SUCCESSFUL, response);
    } catch (e) {
      return ResponseDto.responseError(GovService.name, e);
    }
  }
}
