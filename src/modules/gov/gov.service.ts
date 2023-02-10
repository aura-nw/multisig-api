import { Injectable, Logger } from '@nestjs/common';
import { ResponseDto } from '../../dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { CommonUtil } from '../../utils/common.util';
import { Chain } from '../../entities';
import { ConfigService } from '../../shared/services/config.service';
import { ProposalDepositResponse } from '../../dtos/responses';
import { PROPOSAL_STATUS } from '../../common/constants/app.constant';
import {
  GetProposalsProposal,
  GetProposalsTally,
  GetProposalsTurnout,
} from '../../dtos/responses/gov/get-proposals.response';
import { GetVotesByProposalIdResponse } from '../../dtos/responses/gov/get-votes-by-proposal-id.response';
import { IndexerClient } from '../../utils/apis/IndexerClient';
import { ChainRepository } from '../chain/chain.repository';
import { GetProposalsParamDto } from './dto/get-proposals.dto';
import { GetProposalByIdDto } from './dto/get-proposal-by-id.dto';
import {
  GetVotesByProposalIdParamDto,
  GetVotesByProposalIdQueryDto,
} from './dto/get-vote-by-proposal-dto';
import { GetValidatorVotesDto } from './dto/get-validator-votes.dto';
import { GetProposalDepositsDto } from './dto/get-proposal-deposits.dto';

@Injectable()
export class GovService {
  private readonly _logger = new Logger(GovService.name);
  private _commonUtil: CommonUtil = new CommonUtil();
  private _indexer = new IndexerClient(this.configService.get('INDEXER_URL'));
  auraChain: Chain;

  constructor(
    private configService: ConfigService,
    private chainRepo: ChainRepository,
  ) {
    this._logger.log('============== Constructor Gov Service ==============');
  }

  async getProposals(param: GetProposalsParamDto) {
    const { internalChainId } = param;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);
      const result = await this._indexer.getProposals(chain.chainId);

      const proposals = result.map((proposal) => this.mapProposal(proposal));

      return ResponseDto.response(ErrorMap.SUCCESSFUL, {
        proposals,
      });
    } catch (e) {
      return ResponseDto.responseError(GovService.name, e);
    }
  }

  async getProposalById(param: GetProposalByIdDto) {
    const { internalChainId, proposalId } = param;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);
      const proposal = await this._indexer.getProposal(
        chain.chainId,
        proposalId,
      );

      const result = this.mapProposal(proposal);
      //add additional properties for proposal details page
      const networkStatus = await this._indexer.getNetwork(chain.chainId);
      const bondedTokens = networkStatus.pool.bonded_tokens;

      result.description = proposal.content.description;
      result.type = proposal.content['@type'];
      result.depositEndTime = proposal.deposit_end_time;
      result.turnout = this.calculateProposalTunrout(proposal, bondedTokens);

      return ResponseDto.response(ErrorMap.SUCCESSFUL, result);
    } catch (e) {
      return ResponseDto.responseError(GovService.name, e);
    }
  }

  async getVotesByProposalId(
    param: GetVotesByProposalIdParamDto,
    query: GetVotesByProposalIdQueryDto,
  ): Promise<ResponseDto> {
    const { internalChainId, proposalId } = param;
    const {
      answer,
      nextKey,
      pageOffset = 0,
      pageLimit = 45,
      reverse = false,
    } = query;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);
      const { votes, nextKey: newNextKey } =
        await this._indexer.getVotesByProposalId(
          chain.chainId,
          proposalId,
          answer,
          nextKey,
          pageOffset,
          pageLimit,
          reverse,
        );
      const results: GetVotesByProposalIdResponse = {
        votes: votes.map((vote) => {
          return {
            voter: vote.voter_address,
            txHash: vote.txhash,
            answer: vote.answer,
            time: vote.timestamp,
          };
        }),
        nextKey: newNextKey,
      };
      return ResponseDto.response(ErrorMap.SUCCESSFUL, results);
    } catch (e) {
      return ResponseDto.responseError(GovService.name, e);
    }
  }

  async getValidatorVotesByProposalId(
    param: GetValidatorVotesDto,
  ): Promise<ResponseDto> {
    const { internalChainId, proposalId } = param;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);

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
      const validatorVotes = await this._indexer.getValidatorVotesByProposalId(
        chain.chainId,
        proposalId,
      );

      return ResponseDto.response(ErrorMap.SUCCESSFUL, validatorVotes);
    } catch (e) {
      return ResponseDto.responseError(GovService.name, e);
    }
  }

  async getProposalDepositById(
    param: GetProposalDepositsDto,
  ): Promise<ResponseDto> {
    const { internalChainId, proposalId } = param;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);

      // Get proposal deposit txs
      const proposalDepositTxs =
        await this._indexer.getProposalDepositByProposalId(
          chain.chainId,
          proposalId,
        );
      const response: ProposalDepositResponse[] = proposalDepositTxs.map(
        (tx) => {
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
          return proposalDepositResponse;
        },
      );

      return ResponseDto.response(ErrorMap.SUCCESSFUL, response);
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
}
