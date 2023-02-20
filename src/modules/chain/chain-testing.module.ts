import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IndexerClient } from '../../shared/services/indexer.service';
import { SharedModule } from '../../shared/shared.module';
import { Gas } from '../gas/entities/gas.entity';
import { GasRepository } from '../gas/gas.repository';
import { ChainController } from './chain.controller';
import { ChainRepository } from './chain.repository';
import { ChainService } from './chain.service';
import { Chain } from './entities/chain.entity';

export const chainTestingModule = Test.createTestingModule({
  imports: [SharedModule],
  controllers: [ChainController],
  providers: [
    ChainService,
    ChainRepository,
    GasRepository,
    IndexerClient,
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
