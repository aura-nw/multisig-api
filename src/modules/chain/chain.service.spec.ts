import { TestingModule } from '@nestjs/testing';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { chainList, chains } from '../../mock/chain/chain.mock';
import { IndexerClient } from '../../shared/services/indexer.service';
import { chainTestingModule } from './chain-testing.module';
import { ChainRepository } from './chain.repository';
import { ChainService } from './chain.service';
import { plainToInstance } from 'class-transformer';
import { AccountInfo } from '../../common/dtos';
import { CommonService } from '../../shared/services';
import { ChainDto } from './dto';

describe('ChainService', () => {
  let service: ChainService;
  let chainRepo: ChainRepository;
  let indexerClient: IndexerClient;
  let commonSvc: CommonService;

  beforeEach(async () => {
    const module: TestingModule = await chainTestingModule.compile();

    service = module.get<ChainService>(ChainService);
    chainRepo = module.get<ChainRepository>(ChainRepository);
    indexerClient = module.get<IndexerClient>(IndexerClient);
    commonSvc = module.get<CommonService>(CommonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('showNetworkList', () => {
    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const expectedResult = ResponseDto.response(
        ErrorMap.SUCCESSFUL,
        plainToInstance(ChainDto, chains),
      );

      jest
        .spyOn(chainRepo, 'showNetworkList')
        .mockImplementation(async () => chainList);

      jest
        .spyOn(commonSvc, 'readConfigurationFile')
        .mockImplementation(async () => chains);

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
        .spyOn(indexerClient, 'getAccount')
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
