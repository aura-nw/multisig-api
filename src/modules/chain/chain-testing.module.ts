import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { ChainController } from './chain.controller';
import { ChainRepository } from './chain.repository';
import { ChainService } from './chain.service';
import { Chain } from './entities/chain.entity';
import { CommonService } from '../../shared/services';

export const chainTestingModule = Test.createTestingModule({
  imports: [],
  controllers: [ChainController],
  providers: [
    ChainService,
    ChainRepository,
    ConfigService,
    CommonService,
    HttpService,
    {
      provide: HttpService,
      useValue: {},
    },
    {
      provide: getRepositoryToken(Chain),
      useValue: {},
    },
  ],
});
