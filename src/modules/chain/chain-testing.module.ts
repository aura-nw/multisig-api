import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommonService } from '../../shared/services';
import { IndexerClient } from '../../shared/services/indexer.service';
import { SharedModule } from '../../shared/shared.module';
import { Gas } from '../gas/entities/gas.entity';
import { GasRepository } from '../gas/gas.repository';
import { ChainController } from './chain.controller';
import { ChainRepository } from './chain.repository';
import { ChainService } from './chain.service';
import { Chain } from './entities/chain.entity';

export const chainTestingModule = Test.createTestingModule({
  imports: [],
  controllers: [ChainController],
  providers: [
    ChainService,
    ChainRepository,
    GasRepository,
    {
      provide: IndexerClient,
      useValue: {},
    },
    {
      provide: getRepositoryToken(Chain),
      useValue: {},
    },
    {
      provide: getRepositoryToken(Gas),
      useValue: {},
    },
  ],
});
