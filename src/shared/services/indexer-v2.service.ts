import { Injectable, Logger } from '@nestjs/common';
import { isNumber } from 'lodash';
import { CustomError } from '../../common/custom-error';
import { ErrorMap } from '../../common/error.map';
import {
  IAccountInfo,
  IAccounts,
  IContractAddress,
  IIndexerV2Response,
  IProposal,
  IProposals,
  IPubkey,
} from '../../interfaces';
import { IndexerResponseDto } from '../dtos';
import { CommonService } from './common.service';
import { IAssetsWithType } from '../../interfaces/asset-by-owner.interface';
import { ChainInfo } from '../../utils/validations';

@Injectable()
export class IndexerV2Client {
  private readonly logger = new Logger(IndexerV2Client.name);

  chainInfos: ChainInfo[];

  constructor(private commonService: CommonService) {}

  async getCw20Contract(contractAddress: string, chainId: string) {
    const chainInfos = await this.commonService.readConfigurationFile();
    const selectedChain = chainInfos.find((e) => e.chainId === chainId);
    const operationName = 'cw20';
    const operatorDocs = `
      query ${operationName}($address: String!) {
        ${selectedChain.indexerDb} {
          smart_contract(where: {address: {_eq: $address}}) {
            cw20_contract {
              symbol
            }
          }
        }
      }`;

    const result = await this.commonService.requestPost<
      IndexerResponseDto<IIndexerV2Response<IContractAddress>>
    >(new URL(selectedChain.indexerV2).href, {
      operationName,
      query: operatorDocs,
      variables: {
        address: contractAddress,
      },
    });
    return result?.data[selectedChain.indexerDb].smart_contract[0];
  }

  async checkTokenBalance(
    safeAddress: string,
    amount: number,
    denom: string,
    chainId: string,
  ) {
    const { balances } = await this.getAccount(chainId, safeAddress);

    const balance = balances.find((token) => token.denom === denom);
    if (balance && Number(balance.amount) >= amount) {
      return true;
    }

    throw new CustomError(ErrorMap.BALANCE_NOT_ENOUGH);
  }

  async checkCw20Balance(
    safeAddress: string,
    contractAddress: string,
    amount: number,
    chainId: string,
  ) {
    const cw20Assets = await this.getAssetByOwnerAddress(
      safeAddress,
      'CW20',
      chainId,
    );

    const currentCw20Token = cw20Assets.cw20_holder.find(
      (token) => token.cw20_contract.smart_contract.address === contractAddress,
    );

    if (Number(currentCw20Token.amount) < amount) {
      throw new CustomError(ErrorMap.BALANCE_NOT_ENOUGH);
    }

    return true;
  }

  async getAssetByOwnerAddress(
    ownerAddress: string,
    contractType: string,
    chainId: string,
  ): Promise<IAssetsWithType> {
    const chainInfos = await this.commonService.readConfigurationFile();
    const selectedChain = chainInfos.find((e) => e.chainId === chainId);
    const operationName = 'asset';
    const operatorDocs = `
        query ${operationName}($owner: String = null, $limit: Int = 10) {
          ${selectedChain.indexerDb} {
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

    const result = await this.commonService.requestPost<
      IndexerResponseDto<IIndexerV2Response<IAssetsWithType>>
    >(new URL(selectedChain.indexerV2).href, {
      operationName,
      query: operatorDocs,
      variables: {
        owner: ownerAddress,
        limit: 50,
      },
    });
    return result?.data[selectedChain.indexerDb];
  }

  async getAccountInfo(
    chainId: string,
    address: string,
  ): Promise<IAccountInfo> {
    const chainInfos = await this.commonService.readConfigurationFile();
    const selectedChain = chainInfos.find((e) => e.chainId === chainId);
    const operationName = 'account';
    const operatorDocs = `
      query ${operationName}($address: String = "") {
        ${selectedChain.indexerDb} {
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
      IndexerResponseDto<IIndexerV2Response<IAccounts>>
    >(new URL(selectedChain.indexerV2).href, {
      operationName,
      query: operatorDocs,
      variables: {
        address,
      },
    });
    return result?.data[selectedChain.indexerDb].account[0];
  }

  async getAccount(chainId: string, address: string): Promise<IAccountInfo> {
    const accountInfo = await this.getAccountInfo(chainId, address);
    if (
      !isNumber(accountInfo.sequence) ||
      !isNumber(accountInfo.account_number)
    ) {
      throw new CustomError(ErrorMap.MISSING_ACCOUNT_AUTH);
    }

    return accountInfo;
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
        ${selectedChain.indexerDb} {
          proposal(
            limit: $limit
            where: {proposal_id: {_eq: $proposalId}}
            order_by: {proposal_id: $order}
            ) {
            proposal_id
            content
            count_vote
            deposit_end_time
            description
            initial_deposit
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
      IndexerResponseDto<IIndexerV2Response<IProposals>>
    >(new URL(selectedChain.indexerV2).href, {
      operationName,
      query: operatorDocs,
      variables: {
        limit: 100,
        order: 'desc',
        proposalId,
      },
    });
    const response = result.data[selectedChain.indexerDb].proposal.map(
      (pro) => ({
        ...pro,
        custom_info: {
          chain_id: chainId,
        },
      }),
    );
    return response;
  }
}
