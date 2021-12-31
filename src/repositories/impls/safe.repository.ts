import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './base.repository';
import { ObjectLiteral, Repository } from 'typeorm';
import { ISafeRepository } from '../isafe.repository';
import { ENTITIES_CONFIG } from 'src/module.config';

@Injectable()
export class SafeRepository extends BaseRepository implements ISafeRepository {
  private readonly _logger = new Logger(SafeRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.SAFE)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super(repos);
  }
}
