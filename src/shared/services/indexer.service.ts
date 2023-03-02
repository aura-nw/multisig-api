import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { CustomError } from '../../common/custom-error';
import { AccountInfo } from '../../common/dtos/account-info';
import { ErrorMap } from '../../common/error.map';
import {
  IAccountInfo,
  IAccountUnbound,
  IProposal,
  IProposals,
  IPubkey,
  ITransactions,
  IValidator,
  IValidators,
  NetworkStatus,
} from '../../interfaces';
import { IVotes } from '../../interfaces/votes.interface';
import { IndexerResponseDto } from '../dtos';
import { CommonService } from './common.service';

@Injectable()
export class IndexerClient {
  private readonly logger = new Logger(IndexerClient.name);

  indexerUrl: string;

  constructor(
    private configService: ConfigService,
    private commonService: CommonService,
  ) {
    this.indexerUrl = this.configService.get<string>('INDEXER_URL');
  }

  async getValidatorInfo(chainId: string, operatorAddress: string) {
    const url = new URL(
      `api/v1/validator?operatorAddress=${operatorAddress}&chainid=${chainId}`,
      this.indexerUrl,
    );
    const result = await this.commonService.requestGet<
      IndexerResponseDto<IValidators>
    >(new URL(url, this.indexerUrl).href);
    return result.data.validators[0];
  }

  async getValidators(chainId: string, status: string): Promise<IValidator[]> {
    let url = `api/v1/validator?chainid=${chainId}`;
    if (status) {
      url += `&status=${status}`;
    }
    url += '&pageOffset=0&pageLimit=1000';
    const validatorsRes = await this.commonService.requestGet<
      IndexerResponseDto<IValidators>
    >(new URL(url, this.indexerUrl).href);
    return validatorsRes.data.validators;
  }

  async getValidatorByOperatorAddress(
    chainId: string,
    operatorAddress: string,
  ): Promise<IValidator> {
    const validatorRes = await this.commonService.requestGet<
      IndexerResponseDto<IValidators>
    >(
      new URL(
        `api/v1/validator?operatorAddress=${operatorAddress}&chainid=${chainId}`,
        this.indexerUrl,
      ).href,
    );
    const validator = validatorRes.data.validators[0];
    return validator;
  }

  /**
   * getNetwork
   * @param chainId
   * @returns
   */
  async getNetwork(chainId: string): Promise<NetworkStatus> {
    const url = `api/v1/network/status?chainid=${chainId}`;
    const networkRes = await this.commonService.requestGet<
      IndexerResponseDto<NetworkStatus>
    >(new URL(url, this.indexerUrl).href);
    return networkRes.data;
  }

  async getAccountInfo(
    chainId: string,
    address: string,
  ): Promise<IAccountInfo> {
    const accountInfo = await this.commonService.requestGet<
      IndexerResponseDto<IAccountInfo>
    >(
      new URL(
        `api/v1/account-info?address=${address}&chainId=${chainId}`,
        this.indexerUrl,
      ).href,
    );
    return accountInfo.data;
  }

  async getAccountNumberAndSequence(
    chainId: string,
    address: string,
  ): Promise<AccountInfo> {
    const accountInfo = await this.getAccountInfo(chainId, address);
    if (!accountInfo.account_auth) {
      throw new CustomError(ErrorMap.MISSING_ACCOUNT_AUTH);
    }
    const accountNumber = Number(
      accountInfo.account_auth.account.account_number,
    );

    const sequence = Number(accountInfo.account_auth.account.sequence);

    if (Number.isNaN(accountNumber) || Number.isNaN(sequence)) {
      throw new CustomError(ErrorMap.CANNOT_GET_ACCOUNT_NUMBER_OR_SEQUENCE);
    }
    return plainToInstance(AccountInfo, {
      accountNumber,
      sequence,
    });
  }

  async getAccountPubkey(chainId: string, address: string): Promise<IPubkey> {
    const accountInfo = await this.getAccountInfo(chainId, address);

    if (!accountInfo.account_auth)
      throw new CustomError(ErrorMap.MISSING_ACCOUNT_AUTH);

    const pubkeyInfo = accountInfo.account_auth.account.pub_key;
    if (!pubkeyInfo) throw new CustomError(ErrorMap.MISSING_ACCOUNT_AUTH);
    return pubkeyInfo;
  }

  async getAccountUnBonds(chainId: string, delegatorAddress: string) {
    const undelegationRes = await this.commonService.requestGet<
      IndexerResponseDto<IAccountUnbound>
    >(
      new URL(
        `api/v1/account-unbonds?address=${delegatorAddress}&chainid=${chainId}`,
        this.indexerUrl,
      ).href,
    );
    return undelegationRes.data.account_unbonding;
  }

  async getProposals(chainId: string): Promise<IProposal[]> {
    const proposalsRes = await this.commonService.requestGet<
      IndexerResponseDto<IProposals>
    >(new URL(`api/v1/proposal?chainid=${chainId}`, this.indexerUrl).href);
    return proposalsRes.data.proposals;
  }

  async getProposal(chainId: string, proposalId: number): Promise<IProposal> {
    const proposalRes = await this.commonService.requestGet<
      IndexerResponseDto<IProposals>
    >(
      new URL(
        `api/v1/proposal?chainid=${chainId}&proposalId=${proposalId}`,
        this.indexerUrl,
      ).href,
    );
    return proposalRes.data.proposals[0];
  }

  async getVotesByProposalId(
    chainId: string,
    proposalId: number,
    answer: string,
    nextKey: string,
    pageOffset = 0,
    pageLimit = 45,
    reverse = false,
  ): Promise<IVotes> {
    let url = `api/v1/votes?chainid=${chainId}&proposalid=${proposalId}`;

    url += answer ? `&answer=${answer}` : ''; // optional
    url += nextKey ? `&nextKey=${nextKey}` : ''; // optional
    url += `&pageOffset=${pageOffset}`; // optional
    url += `&pageLimit=${pageLimit}`; // optional
    url += `&reverse=${String(reverse)}`; // optional

    const response = await this.commonService.requestGet<
      IndexerResponseDto<IVotes>
    >(new URL(url, this.indexerUrl).href);
    return response.data;
  }

  async getValidatorVotesByProposalId(
    chainId: string,
    proposalId: number,
  ): Promise<IVotes> {
    const url = `api/v1/votes/validators?chainid=${chainId}&proposalid=${proposalId}`;
    const response = await this.commonService.requestGet<
      IndexerResponseDto<IVotes>
    >(new URL(url, this.indexerUrl).href);
    return response.data;
  }

  async getProposalDepositByProposalId(chainId: string, proposalId: number) {
    const getProposalDepositsURL = new URL(
      `api/v1/transaction?chainid=${chainId}&searchType=proposal_deposit&searchKey=proposal_id&searchValue=${proposalId}&pageOffset=0&pageLimit=10&countTotal=false&reverse=false`,
      this.indexerUrl,
    ).href;
    const response = await this.commonService.requestGet<
      IndexerResponseDto<ITransactions>
    >(getProposalDepositsURL);
    return response.data.transactions;
  }

  async getProposalsByChainId(chainId: string): Promise<IProposal[]> {
    const getProposalByChainIdURL = new URL(
      `api/v1/proposal?chainid=${chainId}&pageLimit=10&pageOffset=0&reverse=false`,
      this.indexerUrl,
    ).href;
    try {
      const response = await this.commonService.requestGet<
        IndexerResponseDto<IProposals>
      >(getProposalByChainIdURL);
      return response.data.proposals || [];
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }
}
