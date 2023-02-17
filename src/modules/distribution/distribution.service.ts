import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ErrorMap } from '../../common/error.map';
import { ConfigService } from '../../shared/services/config.service';
import { CommonUtil } from '../../utils/common.util';
import { IndexerClient } from '../../utils/apis/indexer-client.service';
import { ChainRepository } from '../chain/chain.repository';
import { Chain } from '../chain/entities/chain.entity';
import {
  GetDelegationDto,
  GetDelegationResponseDto,
  GetDelegationsDelegationDto,
  GetDelegationsParamDto,
  GetDelegationsResponseDto,
  GetUndelegationsParamDto,
  GetUndelegationsResponseDto,
  GetUnDelegationsUndelegationDto,
  GetValidatorDetailDto,
  GetValidatorInfoResDto,
  GetValidatorsParamDto,
  GetValidatorsQueryDto,
  GetValidatorsResponseDto,
  GetValidatorsValidatorDto,
} from './dto';
import { ResponseDto } from '../../common/dtos/response.dto';
@Injectable()
export class DistributionService {
  private readonly logger = new Logger(DistributionService.name);
  private chains = new Map<string, Chain>();
  private indexerClient = new IndexerClient(
    this.configService.get('INDEXER_URL'),
  );

  private validatorsPicture = new Map<string, string>();
  indexerUrl: string;
  constructor(
    private configService: ConfigService,
    private chainRepo: ChainRepository,
  ) {
    this.logger.log(
      '============== Constructor Distribution Service ==============',
    );
  }

  /**
   * getChain
   * @param internalChainId
   * @returns
   */
  private async getChain(internalChainId: number): Promise<Chain> {
    if (!this.chains.has(internalChainId.toString())) {
      const chain = await this.chainRepo.findChain(internalChainId);
      this.chains.set(internalChainId.toString(), chain);
    }
    return this.chains.get(internalChainId.toString());
  }

  /**
   * getValidatorInfo
   * @param param
   * @returns
   */
  async getValidatorInfo(param: GetValidatorDetailDto): Promise<ResponseDto> {
    const { operatorAddress, internalChainId } = param;
    const chain = await this.getChain(internalChainId);
    const url = new URL(
      `api/v1/validator?operatorAddress=${operatorAddress}&chainid=${chain.chainId}`,
      this.indexerUrl,
    );
    const validatorRes = await CommonUtil.requestAPI(
      new URL(url, this.indexerUrl).href,
    );

    const validator = validatorRes.data.validators[0];
    const picture = await this.getValidatorPicture(
      validator.description.identity,
    );
    return ResponseDto.response(
      ErrorMap.SUCCESSFUL,
      plainToInstance(GetValidatorInfoResDto, {
        internalChainId,
        validator: validator.description.moniker,
        operatorAddress: validator.operator_address,
        status: validator.status,
        picture: picture,
      }),
    );
  }

  /**
   * getValidators
   * @param param
   * @param query
   * @returns
   */
  async getValidators(
    param: GetValidatorsParamDto,
    query: GetValidatorsQueryDto,
  ): Promise<ResponseDto> {
    const { internalChainId } = param;
    const { status } = query;
    try {
      // Get chain
      const chain = await this.getChain(internalChainId);

      // Get all validators from indexer which status is active
      const validators = await this.indexerClient.getValidators(
        chain.chainId,
        status,
      );

      // Build response
      const validatorsResponse = await Promise.all(
        validators
          .filter((validator) => validator.description)
          .map((validator) => this.formatValidator(validator)),
      );

      return ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        plainToInstance(GetValidatorsResponseDto, {
          validators: validatorsResponse,
        }),
      );
    } catch (e) {
      return ResponseDto.responseError(DistributionService.name, e);
    }
  }

  /**
   * getDelegation
   * @param query
   * @returns
   */
  async getDelegation(query: GetDelegationDto): Promise<ResponseDto> {
    const { internalChainId, delegatorAddress, operatorAddress } = query;
    try {
      // Get chain
      const chain = await this.getChain(internalChainId);

      //get acccount info
      const accountInfo = await this.indexerClient.getAccountInfo(
        chain.chainId,
        delegatorAddress,
      );

      //get validator info
      const validator = await this.indexerClient.getValidatorByOperatorAddress(
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

      return ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        plainToInstance(GetDelegationResponseDto, {
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
        }),
      );
    } catch (e) {
      return ResponseDto.responseError(DistributionService.name, e);
    }
  }

  async getDelegations(param: GetDelegationsParamDto): Promise<ResponseDto> {
    const { internalChainId, delegatorAddress } = param;
    try {
      // Get chain
      const chain = await this.getChain(internalChainId);

      // Get account info
      const accountInfo = await this.indexerClient.getAccountInfo(
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
      const results: GetDelegationsResponseDto = {
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
        const result: GetDelegationsDelegationDto = {
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
    param: GetUndelegationsParamDto,
  ): Promise<ResponseDto> {
    const { internalChainId, delegatorAddress } = param;
    try {
      // Get chain
      const chain = await this.getChain(internalChainId);

      // Get account undelegations
      const accountUnbonding = await this.indexerClient.getAccountUnBonds(
        chain.chainId,
        delegatorAddress,
      );

      // Build response
      const results: GetUndelegationsResponseDto = {
        undelegations: [],
      };
      for (const bond of accountUnbonding) {
        //loop through each entries of a single validator
        for (const entry of bond.entries) {
          const result: GetUnDelegationsUndelegationDto = {
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
  ): Promise<GetValidatorsValidatorDto> {
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
      if (this.validatorsPicture.has(identity)) {
        pictureUrl = this.validatorsPicture.get(identity);
      } else {
        // get picture from keybase
        const keybaseUrl = this.configService.get('KEYBASE');
        const res = await CommonUtil.requestAPI(
          new URL(keybaseUrl + identity).href,
        );
        if (res.them && res.them.length > 0 && res.them[0].pictures.primary)
          pictureUrl = res.them[0].pictures.primary.url;
        if (pictureUrl) {
          // save picture to cache
          this.validatorsPicture.set(identity, pictureUrl);
        }
      }
    } catch (e) {
      this.logger.debug(e);
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
