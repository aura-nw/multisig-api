import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import {
  chainList,
  defaultGas,
  networkList,
} from '../../mock/chain/chain.mock';
import { IndexerClient } from '../../shared/services/indexer.service';
import { SharedModule } from '../../shared/shared.module';
import { Gas } from '../gas/entities/gas.entity';
import { GasRepository } from '../gas/gas.repository';
import { ChainRepository } from './chain.repository';
import { ChainService } from './chain.service';
import { Chain } from './entities/chain.entity';

describe('ChainService', () => {
  let service: ChainService;
  let chainRepo: ChainRepository;
  let gasRepo: GasRepository;
  let indexerClient: IndexerClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      controllers: [],
      providers: [
        ChainService,
        ChainRepository,
        GasRepository,
        {
          provide: getRepositoryToken(Chain),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Gas),
          useValue: {},
        },
        IndexerClient,
      ],
    }).compile();

    service = module.get<ChainService>(ChainService);
    chainRepo = module.get<ChainRepository>(ChainRepository);
    gasRepo = module.get<GasRepository>(GasRepository);
    indexerClient = module.get<IndexerClient>(IndexerClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('showNetworkList', () => {
    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const expectedResult = ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        networkList,
      );

      jest
        .spyOn(chainRepo, 'showNetworkList')
        .mockImplementation(async () => chainList);

      jest
        .spyOn(gasRepo, 'findGasByChainId')
        .mockImplementation(async () => defaultGas);

      const result = await service.showNetworkList();

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAccountOnchain', () => {
    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const getAccountOnchainParamMock = {
        safeAddress: 'aura1522aavcagyrahayuspe47ndje7s694dkzcup6x',
        internalChainId: 22,
      };

      const accountOnchainMock = {
        accountNumber: 41,
        sequence: 109,
      };

      const expectedResult = ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        accountOnchainMock,
      );

      jest
        .spyOn(chainRepo, 'findChain')
        .mockImplementation(async () => chainList[0]);

      jest
        .spyOn(indexerClient, 'getAccountNumberAndSequence')
        .mockImplementation(async () => accountOnchainMock);

      const result = await service.getAccountOnchain(
        getAccountOnchainParamMock,
      );

      expect(result).toEqual(expectedResult);
    });
  });
});
