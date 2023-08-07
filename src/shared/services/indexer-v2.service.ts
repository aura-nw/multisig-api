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
import { IPubkey } from '../../interfaces';
import { IndexerResponseDto } from '../dtos';
import { CommonService } from './common.service';

@Injectable()
export class IndexerV2Client {
  private readonly logger = new Logger(IndexerV2Client.name);

  constructor(
    private configService: ConfigService,
    private commonService: CommonService,
  ) {}

  async getAccountInfo(chainId: string, address: string): Promise<any> {
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
      IndexerResponseDto<unknown>
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
}
