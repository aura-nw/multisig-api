import { Inject, Logger } from '@nestjs/common';
import { StargateClient } from '@cosmjs/stargate';
import { ResponseDto } from 'src/dtos/responses/response.dto';
import { IGeneralService } from '../igeneral.service';
import { BaseService } from './base.service';
import { CommonUtil } from 'src/utils/common.util';
import { MODULE_REQUEST, REPOSITORY_INTERFACE } from 'src/module.config';
import { IGeneralRepository } from 'src/repositories/igeneral.repository';
import { ErrorMap } from 'src/common/error.map';
import { IMultisigWalletRepository } from 'src/repositories';
import { LCDClient } from '@terra-money/terra.js';
import { getEvmosAccount } from 'src/chains/evmos';
import * as axios from 'axios';
import { IGasRepository } from 'src/repositories/igas.repository';

export class GeneralService extends BaseService implements IGeneralService {
  private readonly _logger = new Logger(GeneralService.name);
  private _commonUtil: CommonUtil = new CommonUtil();
  constructor(
    // private configService: ConfigService,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private chainRepo: IGeneralRepository,
    @Inject(REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY)
    private safeRepo: IMultisigWalletRepository,
    @Inject(REPOSITORY_INTERFACE.IGAS_REPOSITORY)
    private gasRepo: IGasRepository,
  ) {
    super(chainRepo);
    this._logger.log(
      '============== Constructor General Service ==============',
    );
  }

  async getValidators(param: MODULE_REQUEST.GetValidatorsParam) {
    const { internalChainId } = param;
    const chain = await this.chainRepo.findChain(internalChainId);
    const result = await axios.default.get(
      new URL(
        '/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED',
        chain.rest,
      ).href,
    );
    return ResponseDto.response(ErrorMap.SUCCESSFUL, result.data);
  }

  async showNetworkList(): Promise<ResponseDto> {
    const res = new ResponseDto();
    const chains = await this.chainRepo.showNetworkList();
    for (const chain of chains) {
      const gas = await this.gasRepo.findByCondition(
        {
          chainId: chain.chainId,
        },
        undefined,
        ['typeUrl', 'gasAmount'],
      );
      chain.defaultGas = gas;
    }
    return res.return(ErrorMap.SUCCESSFUL, chains);
  }

  async getAccountOnchain(
    param: MODULE_REQUEST.GetAccountOnchainParam,
  ): Promise<ResponseDto> {
    const res = new ResponseDto();
    try {
      const safeAddress = { safeAddress: param.safeAddress };
      const safe = await this.safeRepo.findByCondition(safeAddress);
      if (safe.length === 0) return res.return(ErrorMap.NO_SAFES_FOUND);

      const condition = { id: param.internalChainId };
      const chain = await this.chainRepo.findByCondition(condition);
      if (chain.length === 0) return res.return(ErrorMap.CHAIN_ID_NOT_EXIST);

      let client, accountOnChain;
      switch (chain[0].chainId) {
        case 'evmos_9000-4':
          const { sequence, accountNumber } = await getEvmosAccount(
            chain[0].rest,
            param.safeAddress,
          );
          accountOnChain = {
            accountNumber,
            sequence,
            address: param.safeAddress,
            pubkey: safe[0].safePubkey ? JSON.parse(safe[0].safePubkey) : null,
          };
          break;
        case 'terra':
          client = new LCDClient({
            chainID: chain[0].chainId,
            URL: chain[0].rest,
          });
          accountOnChain = await client.auth.accountInfo(param.safeAddress);
          break;
        default:
          client = await StargateClient.connect(chain[0].rpc);
          accountOnChain = await client.getAccount(param.safeAddress);
          break;
      }
      // const balance = await client.getBalance(param.safeAddress, chain[0].denom);
      // return res.return(ErrorMap.SUCCESSFUL, { accountOnChain, balance });
      return res.return(ErrorMap.SUCCESSFUL, accountOnChain);
    } catch (error) {
      console.log(error);
    }
  }
}
