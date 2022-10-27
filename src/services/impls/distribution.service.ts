import { Inject, Injectable, Logger } from '@nestjs/common';
import { ErrorMap } from 'src/common/error.map';
import { GetDelegationResponse, ResponseDto } from 'src/dtos/responses';
import {
  GetDelegationsDelegation,
  GetDelegationsResponse,
} from 'src/dtos/responses/distribution/get-delegations.response';
import {
  GetUndelegationsResponse,
  GetUnDelegationsUndelegation,
} from 'src/dtos/responses/distribution/get-undelegations.response';
import {
  GetValidatorsResponse,
  GetValidatorsValidator,
} from 'src/dtos/responses/distribution/get-validators.response';
import { Chain } from 'src/entities';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from 'src/module.config';
import { IGeneralRepository } from 'src/repositories';
import { ConfigService } from 'src/shared/services/config.service';
import { CommonUtil } from 'src/utils/common.util';
import { IDistributionService } from '../idistribution.service';

@Injectable()
export class DistributionService implements IDistributionService {
  private readonly _logger = new Logger(DistributionService.name);
  private _commonUtil: CommonUtil = new CommonUtil();
  private _chains = new Map<string, Chain>();

  private _validatorPicture = new Map<string, string>();
  indexerUrl: string;
  constructor(
    private configService: ConfigService,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private chainRepo: IGeneralRepository,
  ) {
    this._logger.log(
      '============== Constructor Distribution Service ==============',
    );
    this.indexerUrl = this.configService.get('INDEXER_URL');
  }

  private async getChain(internalChainId: number): Promise<Chain> {
    if (!this._chains.has(internalChainId.toString())) {
      const chain = await this.chainRepo.findChain(internalChainId);
      this._chains.set(internalChainId.toString(), chain);
    }
    return this._chains.get(internalChainId.toString());
  }

  async getValidatorInfo(
    param: MODULE_REQUEST.GetValidatorPathParams,
  ): Promise<ResponseDto> {
    const { operatorAddress, internalChainId } = param;
    const chain = await this.getChain(internalChainId);
    const url = new URL(
      `api/v1/validator?operatorAddress=${operatorAddress}&chainid=${chain.chainId}`,
      this.indexerUrl,
    );
    const validatorRes = await this._commonUtil.request(
      new URL(url, this.indexerUrl).href,
    );

    const validator = validatorRes.data.validators[0];
    const picture = await this.getValidatorPicture(
      validator.description.identity,
    );
    return ResponseDto.response(ErrorMap.SUCCESSFUL, {
      internalChainId,
      validator: validator.description.moniker,
      operatorAddress: validator.operator_address,
      status: validator.status,
      picture: picture,
    });
  }

  async getValidators(
    param: MODULE_REQUEST.GetValidatorsParam,
    query: MODULE_REQUEST.GetValidatorsQuery,
  ): Promise<ResponseDto> {
    const { internalChainId } = param;
    const { status } = query;
    try {
      const chain = await this.getChain(internalChainId);
      let url = `api/v1/validator?chainid=${chain.chainId}`;
      if (status) {
        url += `&status=${status}`;
      }
      const validatorsRes = await this._commonUtil.request(
        new URL(url, this.indexerUrl).href,
      );
      const networkRes = await this._commonUtil.request(
        new URL(
          `api/v1/network/status?chainid=${chain.chainId}`,
          this.indexerUrl,
        ).href,
      );

      const validators = validatorsRes.data.validators;
      const bondedTokens = networkRes.data.pool.bonded_tokens;
      const results: GetValidatorsResponse = {
        validators: [],
      };
      for (const validator of validators) {
        const picture = await this.getValidatorPicture(
          validator.description.identity,
        );
        const result: GetValidatorsValidator = {
          validator: validator.description.moniker,
          operatorAddress: validator.operator_address,
          status: validator.status,
          commission: {
            commission_rates: {
              rate: String(
                Number(validator.commission.commission_rates.rate) * 100,
              ),
            },
          },
          description: {
            moniker: validator.description.moniker,
            picture: picture,
          },
          votingPower: {
            number: (+validator.tokens / 10 ** 6).toFixed(3),
            percentage: String(
              Math.round(Number(validator.percent_voting_power) * 100) / 100,
            ),
          },
          uptime: validator.uptime,
        };
        results.validators.push(result);
      }
      return ResponseDto.response(ErrorMap.SUCCESSFUL, results);
    } catch (e) {
      return ResponseDto.responseError(DistributionService.name, e);
    }
  }

  private async getValidatorPicture(identity: string): Promise<string> {
    let pictureUrl = this.configService.get('DEFAULT_VALIDATOR_IMG');
    try {
      if (!identity) return pictureUrl;
      // get picture in cache
      if (this._validatorPicture.has(identity)) {
        pictureUrl = this._validatorPicture.get(identity);
      } else {
        // get picture from keybase
        const keybaseUrl = this.configService.get('KEYBASE');
        const res = await this._commonUtil.request(
          new URL(keybaseUrl + identity).href,
        );
        pictureUrl = res.them[0].pictures.primary.url;
        if (pictureUrl) {
          // save picture to cache
          this._validatorPicture.set(identity, pictureUrl);
        }
      }
    } catch (e) {
      this._logger.error(e);
    }
    return pictureUrl;
  }

  async getDelegation(
    query: MODULE_REQUEST.GetDelegationQuery,
  ): Promise<ResponseDto> {
    const { internalChainId, delegatorAddress, operatorAddress } = query;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);
      //get delegation info from account
      const delegationRes = await this._commonUtil.request(
        new URL(
          `api/v1/account-info?address=${delegatorAddress}&chainId=${chain.chainId}`,
          this.indexerUrl,
        ).href,
      );
      const accountInfo = delegationRes.data;
      //get validator info
      const validatorRes = await this._commonUtil.request(
        new URL(
          `api/v1/validator?operatorAddress=${operatorAddress}&chainid=${chain.chainId}`,
          this.indexerUrl,
        ).href,
      );
      const validator = validatorRes.data.validators[0];
      // combine info from two api
      const claimedReward = accountInfo.account_claimed_rewards.find(
        (r) => r.validator_address === validator.operator_address,
      );
      const delegationBalance = accountInfo.account_delegations.find(
        (r) => r.delegation.validator_address === validator.operator_address,
      )?.balance;
      const pendingReward = accountInfo.account_delegate_rewards.rewards.find(
        (r) => r.validator_address === validator.operator_address,
      )?.reward[0];
      ///
      const result: GetDelegationResponse = {
        validator: {
          operatorAddress: validator.operator_address,
          votingPower: {
            percent_voting_power: validator.percent_voting_power,
            tokens: {
              amount: validator.tokens,
              denom: chain.symbol,
            },
          },
          commission: validator.commission.commission_rates.rate,
          delegators: validator.number_delegators,
        },
        delegation: {
          claimedReward: claimedReward
            ? {
                denom: claimedReward.denom,
                amount: claimedReward.amount,
              }
            : null,
          delegatableBalance: accountInfo.account_balances[0]
            ? {
                denom: accountInfo.account_balances[0].denom,
                amount: accountInfo.account_balances[0].amount,
              }
            : null,
          delegationBalance: delegationBalance ? delegationBalance : null,
          pendingReward: pendingReward ? pendingReward : null,
        },
      };
      return ResponseDto.response(ErrorMap.SUCCESSFUL, result);
    } catch (e) {
      return ResponseDto.responseError(DistributionService.name, e);
    }
  }

  async getDelegations(
    param: MODULE_REQUEST.GetDelegationsParam,
  ): Promise<ResponseDto> {
    const { internalChainId, delegatorAddress } = param;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);
      const delegationRes = await this._commonUtil.request(
        new URL(
          `api/v1/account-info?address=${delegatorAddress}&chainId=${chain.chainId}`,
          this.indexerUrl,
        ).href,
      );
      const delegations = delegationRes.data?.account_delegations;
      const rewards: any[] =
        delegationRes.data.account_delegate_rewards?.rewards;
      const results: GetDelegationsResponse = {
        availableBalance: delegationRes.data?.account_balances[0]
          ? delegationRes.data.account_balances[0]
          : null,
        delegations: [],
        total: {
          staked:
            delegations.length > 0
              ? this.calculateTotalStaked(delegations)
              : null,
          reward: delegationRes.data.account_delegate_rewards?.total,
        },
      };
      for (const delegation of delegations) {
        const reward = rewards.find(
          (r) =>
            r.validator_address === delegation.delegation.validator_address,
        );
        const result: GetDelegationsDelegation = {
          operatorAddress: delegation.delegation.validator_address,
          balance: delegation.balance,
          reward: reward.reward,
          // name:
        };
        results.delegations.push(result);
      }
      return ResponseDto.response(ErrorMap.SUCCESSFUL, results);
    } catch (e) {
      return ResponseDto.responseError(DistributionService.name, e);
    }
  }

  calculateTotalStaked(delegations: any) {
    let total = 0;
    for (const delegation of delegations) {
      total += +delegation.balance.amount;
    }
    return {
      amount: total.toString(),
      denom: delegations[0].balance.denom,
    };
  }

  async getUndelegations(
    param: MODULE_REQUEST.GetUndelegationsParam,
  ): Promise<ResponseDto> {
    const { internalChainId, delegatorAddress } = param;
    try {
      const chain = await this.chainRepo.findChain(internalChainId);
      const undelegationRes = await this._commonUtil.request(
        new URL(
          `api/v1/account-unbonds?address=${delegatorAddress}&chainid=${chain.chainId}`,
          this.indexerUrl,
        ).href,
      );
      const accountUnbonding = undelegationRes.data.account_unbonding;
      const results: GetUndelegationsResponse = {
        undelegations: [],
      };
      for (const bond of accountUnbonding) {
        //loop through each entries of a single validator
        for (const entry of bond.entries) {
          const result: GetUnDelegationsUndelegation = {
            operatorAddress: bond.validator_address,
            completionTime: entry.completion_time,
            balance: entry.balance,
          };
          results.undelegations.push(result);
        }
      }
      return ResponseDto.response(ErrorMap.SUCCESSFUL, results);
    } catch (e) {
      return ResponseDto.responseError(DistributionService.name, e);
    }
  }
}
