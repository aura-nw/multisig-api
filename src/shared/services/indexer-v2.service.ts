/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { CustomError } from '../../common/custom-error';
import { AccountInfo } from '../../common/dtos/account-info';
import { ErrorMap } from '../../common/error.map';
import { IValidator, IProposal, IPubkey, ITransaction } from '../../interfaces';
import { IndexerResponseDto } from '../dtos';
import { CommonService } from './common.service';
import { IAssetsWithType } from '../../interfaces/asset-by-owner.interface';

@Injectable()
export class IndexerV2Client {
  private readonly logger = new Logger(IndexerV2Client.name);

  indexerUrl: string;

  indexerPathGraphql: string;

  constructor(
    private configService: ConfigService,
    private commonService: CommonService,
  ) {
    this.indexerUrl = this.configService.get<string>('INDEXER_V2_URL');
    this.indexerPathGraphql = this.configService.get<string>(
      'INDEXER_V2_PATH_GRAPHQL',
    );
  }

  async getAssetByOwnerAddress(
    ownerAddress: string,
    contractType: string,
    chainId: string,
  ): Promise<IAssetsWithType> {
    const chainInfos = await this.commonService.readConfigurationFile();
    const selectedChain = chainInfos.find((e) => e.chainId === chainId);
    let operatorDocs = '';
    const operationName = 'asset';
    if (contractType === 'CW721' || contractType === 'CW4973') {
      operatorDocs = `
        query ${operationName}($owner: String = null, $limit: Int = 10) {
          ${selectedChain.indexerV2} {
            cw721_token(
              where: {owner: {_eq: $owner}}
              limit: $limit
            ) {
              media_info
              owner
              token_id
              cw721_contract {
                smart_contract {
                  address
                }
              }
            }
          }
        }
      `;
    } else if (contractType === 'CW20') {
      operatorDocs = `
        query ${operationName}($owner: String = null, $limit: Int = 10) {
          ${selectedChain.indexerV2} {
            cw20_holder(
              where: {address: {_eq: $owner}}
              limit: $limit
            ) {
              cw20_contract {
                symbol
                smart_contract {
                  address
                }
              }
              amount
              address
            }
          }
        }
      `;
    }
    const result = await this.commonService.requestPost<
      IndexerResponseDto<unknown>
    >(new URL(this.indexerPathGraphql, this.indexerUrl).href, {
      operationName,
      query: operatorDocs,
      variables: {
        owner: ownerAddress,
        limit: 50,
      },
    });
    return result?.data[selectedChain.indexerV2];
  }

  async getValidator(
    chainId: string,
    operatorAddress?: string,
    status?: string,
  ): Promise<IValidator[]> {
    const chainInfos = await this.commonService.readConfigurationFile();
    const selectedChain = chainInfos.find((e) => e.chainId === chainId);
    const operationName = 'validator';
    const operatorDocs = `
      query ${operationName}($status: String = null, $limit: Int = 100, $operatorAddress: String = null) {
        ${selectedChain.indexerV2} {
          validator(
            where: {status: {_eq: $status}, operator_address: {_eq: $operatorAddress}}
            limit: $limit
          ) {
            status
            operator_address
            account_address
            commission
            consensus_address
            consensus_hex_address
            consensus_pubkey
            delegator_shares
            delegators_count
            description
            delegators_last_height
            image_url
            index_offset
            jailed
            min_self_delegation
            jailed_until
            missed_blocks_counter
            percent_voting_power
            self_delegation_balance
            start_height
            tokens
            tombstoned
            unbonding_height
            unbonding_time
            updated_at
            uptime
          }
        }
      }
    `;
    const result = await this.commonService.requestPost<
      IndexerResponseDto<unknown>
    >(new URL(this.indexerPathGraphql, this.indexerUrl).href, {
      operationName,
      query: operatorDocs,
      variables: {
        operatorAddress,
        status,
        limit: 100,
      },
    });
    return result?.data[selectedChain.indexerV2].validator;
  }

  async getAccountInfo(chainId: string, address: string): Promise<any> {
    const chainInfos = await this.commonService.readConfigurationFile();
    const selectedChain = chainInfos.find((e) => e.chainId === chainId);
    const operationName = 'account';
    const operatorDocs = `
      query ${operationName}($address: String = "") {
        ${selectedChain.indexerV2} {
          account(where: {address: {_eq: $address}}) {
            account_number
            address
            balances
            pubkey
            sequence
            spendable_balances
            type
            updated_at
          }
        }
      }
    `;
    const result = await this.commonService.requestPost<
      IndexerResponseDto<unknown>
    >(new URL(this.indexerPathGraphql, this.indexerUrl).href, {
      operationName,
      query: operatorDocs,
      variables: {
        address,
      },
    });
    return result?.data[selectedChain.indexerV2].account;
  }

  async getAccountBalances(chainId: string, address: string): Promise<any[]> {
    const { balances: accountBalances } = await this.getAccountInfo(
      chainId,
      address,
    );
    if (accountBalances?.length > 0) {
      return accountBalances.map((item) => {
        if (!item.denom) return item;

        return {
          amount: item.amount,
          denom: item.base_denom,
          minimal_denom: item.denom,
        };
      });
    }
    return undefined;
  }

  async getAccount(chainId: string, address: string): Promise<AccountInfo> {
    const accountInfo = await this.getAccountInfo(chainId, address);
    if (!accountInfo.sequence || !accountInfo.account_number) {
      throw new CustomError(ErrorMap.MISSING_ACCOUNT_AUTH);
    }

    return plainToInstance(AccountInfo, {
      accountNumber: accountInfo.account_number,
      sequence: accountInfo.sequence,
      balances: accountInfo.balances,
    });
  }

  async getAccountPubkey(chainId: string, address: string): Promise<IPubkey> {
    const accountInfo = await this.getAccountInfo(chainId, address);

    const pubkeyInfo = accountInfo.pubkey;
    if (!pubkeyInfo) throw new CustomError(ErrorMap.MISSING_ACCOUNT_AUTH);
    return pubkeyInfo;
  }

  async getProposals(
    chainId: string,
    proposalId?: number,
  ): Promise<IProposal[]> {
    const chainInfos = await this.commonService.readConfigurationFile();
    const selectedChain = chainInfos.find((e) => e.chainId === chainId);
    const operationName = 'proposal';
    const operatorDocs = `
      query ${operationName}($limit: Int = 10, $order: order_by = desc, $proposalId: Int = null) {
        ${selectedChain.indexerV2} {
          proposal(
            limit: $limit
            where: {proposal_id: {_eq: $proposalId}}
            order_by: {proposal_id: $order}
          ) {
            content
            count_vote
            deposit_end_time
            description
            initial_deposit
            proposal_id
            proposer_address
            status
            submit_time
            tally
            title
            total_deposit
            turnout
            type
            voting_end_time
            voting_start_time
            updated_at
          }
        }
      }
    `;
    const result = await this.commonService.requestPost<
      IndexerResponseDto<unknown>
    >(new URL(this.indexerPathGraphql, this.indexerUrl).href, {
      operationName,
      query: operatorDocs,
      variables: {
        limit: 100,
        order: 'desc',
        proposalId,
      },
    });
    const response = result?.data[selectedChain.indexerV2].proposal.map(
      (pro) => ({
        ...pro,
        custom_info: {
          chain_id: chainId,
        },
      }),
    );
    return response;
  }

  async getVotesByProposalId(
    chainId: string,
    proposalId: number,
    voteOption: string,
    pageOffset = 0,
    pageLimit = 45,
  ): Promise<any> {
    const chainInfos = await this.commonService.readConfigurationFile();
    const selectedChain = chainInfos.find((e) => e.chainId === chainId);
    const operationName = 'vote';
    const operatorDocs = `
      query ${operationName}($limit: Int = 10, $order: order_by = desc, $proposalId: Int = null, $voteOption: String = null, $offset: Int = 0) {
        ${selectedChain.indexerV2} {
          vote(
            limit: $limit
            where: {proposal_id: {_eq: $proposalId}, vote_option: {_eq: $voteOption}}
            order_by: {updated_at: $order}
            offset: $offset
          ) {
            proposal_id
            txhash
            vote_option
            voter
            transaction {
              timestamp
            }
          }
        }
      }
    `;
    const result = await this.commonService.requestPost<
      IndexerResponseDto<unknown>
    >(new URL(this.indexerPathGraphql, this.indexerUrl).href, {
      operationName,
      query: operatorDocs,
      variables: {
        limit: pageLimit,
        offset: pageOffset,
        proposalId,
        voteOption,
        order: 'desc',
      },
    });
    return result?.data[selectedChain.indexerV2].vote;
  }

  async getValidatorVotesByProposalId(
    chainId: string,
    proposalId: number,
  ): Promise<any> {
    const url = `api/v1/votes/validators?chainid=${chainId}&proposalid=${proposalId}`;
    const response = await this.commonService.requestGet<
      IndexerResponseDto<any>
    >(new URL(url, this.indexerUrl).href);
    return response.data;
  }

  async getProposalDepositByProposalId(
    chainId: string,
    proposalId: number,
  ): Promise<ITransaction[]> {
    const chainInfos = await this.commonService.readConfigurationFile();
    const selectedChain = chainInfos.find((e) => e.chainId === chainId);
    const operationName = 'deposit';
    const operatorDocs = `
      query ${operationName}(
        $limit: Int = 100
        $order: order_by = desc
        $compositeKey: String = null
        $value: String = null
        $key: String = null
        $compositeKeyIn: [String!] = null
        $valueIn: [String!] = null
        $keyIn: [String!] = null
        $heightGT: Int = null
        $heightLT: Int = null
        $indexGT: Int = null
        $indexLT: Int = null
        $hash: String = null
        $height: Int = null
      ) {
        ${selectedChain.indexerV2} {
          transaction(
            limit: $limit
            where: {
              hash: { _eq: $hash }
              height: { _eq: $height }
              event_attribute_index: {
                value: { _eq: $value, _in: $valueIn }
                composite_key: { _eq: $compositeKey, _in: $compositeKeyIn }
                key: { _eq: $key, _in: $keyIn }
              }
              _and: [
                { height: { _gt: $heightGT } }
                { index: { _gt: $indexGT } }
                { height: { _lt: $heightLT } }
                { index: { _lt: $indexLT } }
              ]
            }
            order_by: [{ height: $order}, {index: $order }]
          ) {
            id
            height
            hash
            timestamp
            code
            gas_used
            gas_wanted
            data
          }
        }
      }
    `;
    const result = await this.commonService.requestPost<
      IndexerResponseDto<unknown>
    >(new URL(this.indexerPathGraphql, this.indexerUrl).href, {
      operationName,
      query: operatorDocs,
      variables: {
        limit: 100,
        order: 'desc',
        value: proposalId.toString(),
        compositeKey: 'proposal_deposit.proposal_id',
        key: 'proposal_id',
        heightGT: undefined,
        indexGT: undefined,
        indexLT: undefined,
        height: undefined,
      },
    });
    return result?.data[selectedChain.indexerV2].transaction.map(
      (tx) => tx.data,
    );
  }
}
