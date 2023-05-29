import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommonService, IndexerClient } from '../../shared/services';
import { ChainRepository } from '../chain/chain.repository';
import { Chain } from '../chain/entities/chain.entity';
import { GovController } from './gov.controller';
import { GovService } from './gov.service';

export const govTestingModule = Test.createTestingModule({
  imports: [],
  controllers: [GovController],
  providers: [
    GovService,
    IndexerClient,
    ChainRepository,
    {
      provide: ConfigService,
      useValue: {
        get: jest.fn().mockReturnValue('localhost'),
      },
    },
    {
      provide: CommonService,
      useValue: {},
    },
    {
      provide: getRepositoryToken(Chain),
      useValue: {},
    },
  ],
});
