import { Inject, Injectable, Logger } from '@nestjs/common';
import { ErrorMap } from '../../common/error.map';
import { GetDelegationResponse, ResponseDto } from '../../dtos/responses';
import {
  GetDelegationsDelegation,
  GetDelegationsResponse,
} from '../../dtos/responses/distribution/get-delegations.response';
import {
  GetUndelegationsResponse,
  GetUnDelegationsUndelegation,
} from '../../dtos/responses/distribution/get-undelegations.response';
import {
  GetValidatorsResponse,
  GetValidatorsValidator,
} from '../../dtos/responses/distribution/get-validators.response';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from '../../module.config';
import { IGeneralRepository } from '../../repositories';
import { ConfigService } from '../../shared/services/config.service';
import { CommonUtil } from '../../utils/common.util';
import { Chain } from '../../entities';
import { IDistributionService } from '../idistribution.service';
import { IndexerAPI } from 'src/utils/apis/IndexerAPI';

@Injectable()
export class DistributionService implements IDistributionService {
  private readonly _logger = new Logger(DistributionService.name);
  private _commonUtil: CommonUtil = new CommonUtil();
  private _chains = new Map<string, Chain>();
  private _indexer = new IndexerAPI(this.configService.get('INDEXER_URL'));

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
      // Get chain
      const chain = await this.getChain(internalChainId);

      // Get all validators from indexer which status is active
      const validators = await this._indexer.getValidators(
        chain.chainId,
        status,
      );
      // Get network info
      // const networkRes = await this._indexer.getNetwork(chain.chainId);

      // const bondedTokens = networkRes.pool.bonded_tokens;

      // Build response
      const validatorsResponse = await Promise.all(
        validators.filter((validator) => validator.description).map((validator) => this.formatValidator(validator)),
      );
      const results: GetValidatorsResponse = {
        validators: validatorsResponse,
      };
      return ResponseDto.response(ErrorMap.SUCCESSFUL, results);
    } catch (e) {
      return ResponseDto.responseError(DistributionService.name, e);
    }
  }

  async getDelegation(
    query: MODULE_REQUEST.GetDelegationQuery,
  ): Promise<ResponseDto> {
    const { internalChainId, delegatorAddress, operatorAddress } = query;
    try {
      // Get chain
      const chain = await this.getChain(internalChainId);

      //get acccount info
      const accountInfo = await this._indexer.getAccountInfo(
        chain.chainId,
        delegatorAddress,
      );

      //get validator info
      const validator = await this._indexer.getValidatorByOperatorAddress(
        chain.chainId,
        operatorAddress,
      );

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

      // Build response
      const result: GetDelegationResponse = {
        validator: {
          operatorAddress: validator.operator_address,
          votingPower: {
            percent_voting_power:
              Math.round(Number(validator.percent_voting_power) * 100) / 100,
            tokens: {
              amount: validator.tokens,
              denom: chain.symbol,
            },
          },
          commission: String(
            Number(validator.commission.commission_rates.rate) * 100,
          ),
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
      // Get chain
      const chain = await this.getChain(internalChainId);

      // Get account info
      const accountInfo = await this._indexer.getAccountInfo(
        chain.chainId,
        delegatorAddress,
      );

      // Get delegate info
      const delegations = accountInfo.account_delegations.filter(
        (delegation) => {
          return Number(delegation.balance.amount) > 0;
        },
      );
      const delegateRewards = accountInfo.account_delegate_rewards;
      const rewards: any[] = delegateRewards.rewards;

      // Build response
      const results: GetDelegationsResponse = {
        availableBalance: accountInfo.account_balances[0]
          ? accountInfo.account_balances[0]
          : null,
        delegations: [],
        total: {
          staked:
            delegations.length > 0
              ? this.calculateTotalStaked(delegations)
              : null,
          reward: delegateRewards.total,
        },
      };

      // Build delegations
      for (const delegation of delegations) {
        const reward = rewards.find(
          (r) =>
            r.validator_address === delegation.delegation.validator_address,
        );
        const result: GetDelegationsDelegation = {
          operatorAddress: delegation.delegation.validator_address,
          balance: delegation.balance,
          reward: reward ? reward.reward : [],
        };
        results.delegations.push(result);
      }

      return ResponseDto.response(ErrorMap.SUCCESSFUL, results);
    } catch (e) {
      return ResponseDto.responseError(DistributionService.name, e);
    }
  }

  async getUndelegations(
    param: MODULE_REQUEST.GetUndelegationsParam,
  ): Promise<ResponseDto> {
    const { internalChainId, delegatorAddress } = param;
    try {
      // Get chain
      const chain = await this.getChain(internalChainId);

      // Get account undelegations
      const accountUnbonding = await this._indexer.getAccountUnBonds(
        chain.chainId,
        delegatorAddress,
      );

      // Build response
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

  private async formatValidator(
    validator: any,
  ): Promise<GetValidatorsValidator> {
    const picture = await this.getValidatorPicture(
      validator.description.identity,
    );
    return {
      validator: validator.description.moniker,
      operatorAddress: validator.operator_address,
      status: validator.status,
      commission: {
        commission_rates: {
          rate: Number(validator.commission.commission_rates.rate) * 100,
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
        if (res.them && res.them.length > 0 && res.them[0].pictures.primary)
          pictureUrl = res.them[0].pictures.primary.url;
        if (pictureUrl) {
          // save picture to cache
          this._validatorPicture.set(identity, pictureUrl);
        }
      }
    } catch (e) {
      this._logger.debug(e);
    }
    return pictureUrl;
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
}
