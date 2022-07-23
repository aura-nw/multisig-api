import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomError } from 'src/common/customError';
import { ErrorMap } from 'src/common/error.map';
import { Chain, Gas } from 'src/entities';
import { ENTITIES_CONFIG } from 'src/module.config';
import { ObjectLiteral, Repository } from 'typeorm';
import { IGasRepository } from '../igas.repository';
import { BaseRepository } from './base.repository';

@Injectable()
export class GasRepository extends BaseRepository implements IGasRepository {
  private readonly _logger = new Logger(GasRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.GAS)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Gas Repository ==============',
    );
  }
}
