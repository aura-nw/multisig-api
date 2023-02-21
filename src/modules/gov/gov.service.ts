import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { CommonUtil } from '../../utils/common.util';
import { ConfigService } from '../../shared/services/config.service';
import { ProposalStatus } from '../../common/constants/app.constant';
import { IndexerClient } from '../../utils/apis/indexer-client.service';
import { ChainRepository } from '../chain/chain.repository';
import {
  GetProposalByIdDto,
  GetProposalDepositsDto,
  GetProposalsParamDto,
  GetProposalsResponseDto,
  GetProposalsTally,
  GetProposalsTurnout,
  GetValidatorVotesByProposalIdResponseDto,
  GetValidatorVotesDto,
  GetVotesByProposalIdParamDto,
  GetVotesByProposalIdQueryDto,
  GetVotesByProposalIdResponseDto,
  ProposalDepositResponseDto,
  ProposalDetailDto,
} from './dto';
import { Chain } from '../chain/entities/chain.entity';

@Injectable()
export class GovService {
  private readonly logger = new Logger(GovService.name);

  private commonUtil: CommonUtil = new CommonUtil();

  private indexer = new IndexerClient(this.configService.get('INDEXER_URL'));

  auraChain: Chain;

  constructor(
    private configService: ConfigService,
    private chainRepo: ChainRepository,
  ) {
    this.logger.log('============== Constructor Gov Service ==============');
  }

  async getProposals(param: GetProposalsParamDto) {
    const { internalChainId } = param;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);
      const result = await this.indexer.getProposals(chain.chainId);

      const proposals = result.map((proposal) => this.mapProposal(proposal));

      return ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        plainToInstance(GetProposalsResponseDto, {
          proposals,
        }),
      );
    } catch (error) {
      return ResponseDto.responseError(GovService.name, error);
    }
  }

  async getProposalById(param: GetProposalByIdDto) {
    const { internalChainId, proposalId } = param;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);
      const proposal = await this.indexer.getProposal(
        chain.chainId,
        proposalId,
      );

      const result = this.mapProposal(proposal);
      // add additional properties for proposal details page
      const networkStatus = await this.indexer.getNetwork(chain.chainId);
      const bondedTokens = networkStatus.pool.bonded_tokens;

      result.description = proposal.content.description;
      result.type = proposal.content['@type'];
      result.depositEndTime = proposal.deposit_end_time;
      result.turnout = this.calculateProposalTunrout(proposal, bondedTokens);

      return ResponseDto.response(ErrorMap.SUCCESSFUL, result);
    } catch (error) {
      return ResponseDto.responseError(GovService.name, error);
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
        await this.indexer.getVotesByProposalId(
          chain.chainId,
          proposalId,
          answer,
          nextKey,
          pageOffset,
          pageLimit,
          reverse,
        );
      const results: GetVotesByProposalIdResponseDto = {
        votes: votes.map((vote) => ({
          voter: vote.voter_address,
          txHash: vote.txhash,
          answer: vote.answer,
          time: vote.timestamp,
        })),
        nextKey: newNextKey,
      };
      return ResponseDto.response(ErrorMap.SUCCESSFUL, results);
    } catch (error) {
      return ResponseDto.responseError(GovService.name, error);
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
      const validatorVotes = await this.indexer.getValidatorVotesByProposalId(
        chain.chainId,
        proposalId,
      );

      return ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        plainToInstance(
          GetValidatorVotesByProposalIdResponseDto,
          validatorVotes,
        ),
      );
    } catch (error) {
      return ResponseDto.responseError(GovService.name, error);
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
        await this.indexer.getProposalDepositByProposalId(
          chain.chainId,
          proposalId,
        );
      const response: ProposalDepositResponseDto[] = proposalDepositTxs.map(
        (tx) => {
          const proposalDepositEvent = tx.tx_response.logs[0].events.find(
            (x) => x.type === 'proposal_deposit',
          );
          const proposalDepositResponse: ProposalDepositResponseDto = {
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
    } catch (error) {
      return ResponseDto.responseError(GovService.name, error);
    }
  }

  mapProposal(proposal: any) {
    const result: ProposalDetailDto = {
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
    // default to final result of tally property
    let tally = proposal.final_tally_result;
    if (proposal.status === ProposalStatus.VOTING_PERIOD) {
      tally = proposal.tally;
    }
    // default mostVoted to yes
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
        percent: this.commonUtil.getPercentage(tally.yes, sum),
      },
      abstain: {
        number: tally.abstain,
        percent: this.commonUtil.getPercentage(tally.abstain, sum),
      },
      no: {
        number: tally.no,
        percent: this.commonUtil.getPercentage(tally.no, sum),
      },
      noWithVeto: {
        number: tally.no_with_veto,
        percent: this.commonUtil.getPercentage(tally.no_with_veto, sum),
      },
      mostVotedOn: {
        name: mostVotedOptionKey,
        percent: this.commonUtil.getPercentage(tally[mostVotedOptionKey], sum),
      },
    };
    return result;
  }

  calculateProposalTunrout(proposal: any, bondedTokens: string) {
    // default to final result of tally property
    let tally = proposal.final_tally_result;
    if (proposal.status === ProposalStatus.VOTING_PERIOD) {
      tally = proposal.tally;
    }
    const numberOfVoted = +tally.yes + +tally.no + +tally.no_with_veto;
    const numberOfNotVoted = +bondedTokens - numberOfVoted - +tally.abstain;
    const result: GetProposalsTurnout = {
      voted: {
        number: numberOfVoted.toString(),
        percent: this.commonUtil.getPercentage(numberOfVoted, bondedTokens),
      },
      votedAbstain: {
        number: tally.abstain,
        percent: this.commonUtil.getPercentage(tally.abstain, bondedTokens),
      },
      didNotVote: {
        number: numberOfNotVoted.toString(),
        percent: this.commonUtil.getPercentage(numberOfNotVoted, bondedTokens),
      },
    };
    return result;
  }
}
