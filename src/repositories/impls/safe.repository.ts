import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ENTITIES_CONFIG } from '../../module.config';
import { ObjectLiteral, Repository } from 'typeorm';
import { ISafeRepository } from '../isafe.repository';
import { BaseRepository } from './base.repository';

@Injectable()
export class SafeRepository extends BaseRepository implements ISafeRepository {
  private readonly _logger = new Logger(SafeRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.SAFE)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Safe Repository ==============',
    );
  }
}
