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

  async getAccountUnBonds(chainId: string, delegatorAddress: string) {
    const undelegationRes = await this._commonUtil.request(
      new URL(
        `api/v1/account-unbonds?address=${delegatorAddress}&chainid=${chainId}`,
        this.indexerUrl,
      ).href,
    );
    return undelegationRes.data.account_unbonding;
  }
}
