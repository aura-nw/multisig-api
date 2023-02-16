import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Gas } from './entities/gas.entity';

@Injectable()
export class GasRepository {
  private readonly _logger = new Logger(GasRepository.name);
  constructor(
    @InjectRepository(Gas)
    public readonly repos: Repository<Gas>,
  ) {
    this._logger.log(
      '============== Constructor Gas Repository ==============',
    );
  }

  /**
   * findGasByChainId
   * @param chainId
   * @returns
   */
  async findGasByChainIds(chainIds: string[]): Promise<Gas[]> {
    return this.repos.find({
      where: {
        chainId: In(chainIds),
      },
      select: ['typeUrl', 'gasAmount', 'multiplier', 'chainId'],
    });
  }
}
