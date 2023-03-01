import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommonService } from '../../shared/services';
import { IndexerClient } from '../../shared/services/indexer.service';
import { ChainRepository } from '../chain/chain.repository';
import { Chain } from '../chain/entities/chain.entity';
import { DistributionController } from './distribution.controller';
import { DistributionService } from './distribution.service';

export const distributionTestingModule = Test.createTestingModule({
  imports: [],
  controllers: [DistributionController],
  providers: [
    DistributionService,
    ConfigService,
    IndexerClient,
    CommonService,
    ChainRepository,
    {
      provide: getRepositoryToken(Chain),
      useValue: {},
    },
    {
      provide: HttpService,
      useValue: {},
    },
  ],
});
