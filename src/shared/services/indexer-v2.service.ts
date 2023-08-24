import { Injectable, Logger } from '@nestjs/common';
import { isNumber } from 'lodash';
import { CustomError } from '../../common/custom-error';
import { ErrorMap } from '../../common/error.map';
import {
  IAccountInfo,
  IAccounts,
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

  async getAccount(chainId: string, address: string): Promise<IAccountInfo> {
    const accountInfo = await this.getAccountInfo(chainId, address);
    if (!isNumber(accountInfo.sequence) || !accountInfo.account_number) {
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
