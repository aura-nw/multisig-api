import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import { Chain } from '../../entities';
import { ENTITIES_CONFIG } from '../../module.config';
import { ObjectLiteral, Repository } from 'typeorm';
import { IGeneralRepository } from '../igeneral.repository';
import { BaseRepository } from './base.repository';

@Injectable()
export class GeneralRepository
  extends BaseRepository
  implements IGeneralRepository
{
  private readonly _logger = new Logger(GeneralRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.CHAIN)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor General Repository ==============',
    );
  }

  async showNetworkList() {
    const sqlQuerry = this.repos
      .createQueryBuilder('chain')
      .select([
        'chain.id as id',
        'chain.name as name',
        'chain.rest as rest',
        'chain.rpc as rpc',
        'chain.explorer as explorer',
        'chain.chainId as chainId',
        'chain.symbol as symbol',
        'chain.denom as denom',
        'chain.prefix as prefix',
        'chain.coinDecimals as coinDecimals',
        'chain.gasPrice as gasPrice',
        'chain.tokenImg as tokenImg',
      ]);
    const result = await sqlQuerry.getRawMany();
    return result;
  }

  async findChain(internalChainId: number): Promise<Chain> {
    const chainInfo = (await this.findOne({ id: internalChainId })) as Chain;
    if (!chainInfo) throw new CustomError(ErrorMap.CHAIN_ID_NOT_EXIST);
    return chainInfo;
  }

  async findChainByChainId(chainId: string): Promise<Chain> {
    const chainInfo = (await this.findOne({ chainId })) as Chain;
    if (!chainInfo) throw new CustomError(ErrorMap.CHAIN_ID_NOT_EXIST);
    return chainInfo;
  }
}
