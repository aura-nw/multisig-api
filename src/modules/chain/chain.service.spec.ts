import { TestingModule } from '@nestjs/testing';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import {
  chainList,
  defaultGas,
  networkList,
} from '../../mock/chain/chain.mock';
import { IndexerClient } from '../../shared/services/indexer.service';
import { GasRepository } from '../gas/gas.repository';
import { chainTestingModule } from './chain-testing.module';
import { ChainRepository } from './chain.repository';
import { ChainService } from './chain.service';
import { plainToInstance } from 'class-transformer';
import { AccountInfo } from '../../common/dtos';

describe('ChainService', () => {
  let service: ChainService;
  let chainRepo: ChainRepository;
  let gasRepo: GasRepository;
  let indexerClient: IndexerClient;

  beforeEach(async () => {
    const module: TestingModule = await chainTestingModule
      .overrideProvider(IndexerClient)
      .useValue({
        getAccountNumberAndSequence: jest.fn(),
      })
      .compile();

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
        .mockImplementation(async () =>
          plainToInstance(AccountInfo, accountOnchainMock),
        );

      const result = await service.getAccountOnchain(
        getAccountOnchainParamMock,
      );

      expect(result).toEqual(expectedResult);
    });
  });
});
