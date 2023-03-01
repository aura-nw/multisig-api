import { ConfigService } from '@nestjs/config';
import { TestingModule } from '@nestjs/testing';
import { ResponseDto } from '../../common/dtos/response.dto';
import { ErrorMap } from '../../common/error.map';
import { chainList, defaultGas } from '../../mock/chain/chain.mock';
import { CommonService } from '../../shared/services';
import { IndexerClient } from '../../shared/services/indexer.service';
import { ChainRepository } from '../chain/chain.repository';
import { distributionTestingModule } from './distribution-testing.module';
import { DistributionService } from './distribution.service';
import { mockValidators, rawValidatorMock } from './mocks';

describe('ChainService', () => {
  let service: DistributionService;
  let chainRepo: ChainRepository;
  let configService: ConfigService;
  let commonSvc: CommonService;
  let indexerClient: IndexerClient;

  beforeEach(async () => {
    const module: TestingModule = await distributionTestingModule.compile();

    service = module.get<DistributionService>(DistributionService);
    configService = module.get<ConfigService>(ConfigService);
    chainRepo = module.get<ChainRepository>(ChainRepository);
    commonSvc = module.get<CommonService>(CommonService);
    indexerClient = module.get<IndexerClient>(IndexerClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getValidatorInfo', () => {
    it(`should return: ${ErrorMap.SUCCESSFUL.Message}`, async () => {
      const expectedResult = ResponseDto.response(ErrorMap.SUCCESSFUL, {
        validators: mockValidators,
      });

      jest
        .spyOn(chainRepo, 'findChain')
        .mockImplementation(async () => chainList[0]);

      jest.spyOn(commonSvc, 'requestGet').mockImplementation(async () => ({
        data: {
          validators: [rawValidatorMock];
        }
      }));

      jest.spyOn(configService, 'get').mockImplementation(() => defaultGas);

      const result = await service.showNetworkList();

      expect(result).toEqual(expectedResult);
    });
  });
});
