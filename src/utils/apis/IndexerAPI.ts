import { CustomError } from 'src/common/customError';
import { ErrorMap } from 'src/common/error.map';
import { CommonUtil } from '../common.util';

export class IndexerAPI {
  private _commonUtil: CommonUtil = new CommonUtil();

  constructor(public indexerUrl: string) {}

  async getValidators(chainId: string, status: string) {
    let url = `api/v1/validator?chainid=${chainId}`;
    if (status) {
      url += `&status=${status}`;
    }
    const validatorsRes = await this._commonUtil.request(
      new URL(url, this.indexerUrl).href,
    );
    return validatorsRes.data.validators;
  }

  async getValidatorByOperatorAddress(
    chainId: string,
    operatorAddress: string,
  ) {
    const validatorRes = await this._commonUtil.request(
      new URL(
        `api/v1/validator?operatorAddress=${operatorAddress}&chainid=${chainId}`,
        this.indexerUrl,
      ).href,
    );
    const validator = validatorRes.data.validators[0];
    return validator;
  }

  async getNetwork(chainId: string) {
    const url = `api/v1/network/status?chainid=${chainId}`;
    const networkRes = await this._commonUtil.request(
      new URL(url, this.indexerUrl).href,
    );
    return networkRes.data;
  }

  async getAccountInfo(chainId: string, address: string) {
    const accountInfo = await this._commonUtil.request(
      new URL(
        `api/v1/account-info?address=${address}&chainId=${chainId}`,
        this.indexerUrl,
      ).href,
    );
    return accountInfo.data;
  }

  async getAccountNumberAndSequence(chainId: string, address: string) {
    const accountInfo = await this.getAccountInfo(chainId, address);
    if (!accountInfo.account_auth) {
      throw new CustomError(ErrorMap.MISSING_ACCOUNT_AUTH);
    }
    const accountNumber = Number(
      accountInfo.account_auth.result.value.account_number,
    );

    const sequence = Number(accountInfo.account_auth.result.value.sequence);

    if (isNaN(accountNumber) || isNaN(sequence)) {
      throw new CustomError(ErrorMap.CANNOT_GET_ACCOUNT_NUMBER_OR_SEQUENCE);
    }
    return {
      accountNumber,
      sequence,
    };
  }

  async getAccountUnBonds(chainId: string, delegatorAddress: string) {
    const undelegationRes = await this._commonUtil.request(
      new URL(
        `api/v1/account-unbonds?address=${delegatorAddress}&chainid=${chainId}`,
        this.indexerUrl,
      ).href,
    );
    return undelegationRes.data.account_unbonding;
  }

  async getProposals(chainId: string) {
    const proposalsRes = await this._commonUtil.request(
      new URL(`api/v1/proposal?chainid=${chainId}`, this.indexerUrl).href,
    );
    return proposalsRes.data.proposals;
  }

  async getProposal(chainId: string, proposalId: number) {
    const proposalRes = await this._commonUtil.request(
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
  ) {
    let url = `api/v1/votes?chainid=${chainId}&proposalid=${proposalId}`;

    url += answer ? `&answer=${answer}` : ''; //optional
    url += nextKey ? `&nextKey=${nextKey}` : ''; //optional
    url += `&pageOffset=${pageOffset}`; //optional
    url += `&pageLimit=${pageLimit}`; //optional
    url += `&reverse=${reverse}`; //optional

    const response = await this._commonUtil.request(
      new URL(url, this.indexerUrl).href,
    );
    return {
      votes: response.data.votes,
      nextKey: response.data.nextKey,
    };
  }

  async getValidatorVotesByProposalId(chainId: string, proposalId: number) {
    const url = `api/v1/votes/validators?chainid=${chainId}&proposalid=${proposalId}`;
    const response = await this._commonUtil.request(
      new URL(url, this.indexerUrl).href,
    );
    return response.data;
  }

  async getProposalDepositByProposalId(chainId: string, proposalId: number) {
    const getProposalDepositsURL = new URL(
      `api/v1/transaction?chainid=${chainId}&searchType=proposal_deposit&searchKey=proposal_id&searchValue=${proposalId}&pageOffset=0&pageLimit=10&countTotal=false&reverse=false`,
      this.indexerUrl,
    ).href;
    const response = await this._commonUtil.request(getProposalDepositsURL);
    return response.data.transactions;
  }
}
